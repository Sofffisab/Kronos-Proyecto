# pip install -r lib.txt --no-warn-script-location
import sys
import json
import base64
import os
from google import genai
from google.genai import types
from PIL import Image
from io import BytesIO
from pydantic import BaseModel
from typing import List
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

client = genai.Client(api_key=os.getenv("GEMINI_KEY"))
clientChat = OpenAI(api_key=os.getenv("CHAT_KEY"))

# Herramienta de búsqueda de Google (solo para Gemini)
grounding_tool = types.Tool(
    google_search=types.GoogleSearch()
)

# MODELOS DE DATOS (PYDANTIC)

class WebsiteValue(BaseModel):
    criterion: str
    website1: str
    website2: str
    website3: str
    website4: str
    conclusion: str

class TableRow(BaseModel):
    row: WebsiteValue

class TableData(BaseModel):
    rows: List[TableRow]

# FUNCIONES DE UTILIDAD

def load_data_from_stdin():
    """Carga datos enviados desde el backend Node.js por stdin"""
    try:
        # Leer todo el stdin
        input_data = sys.stdin.read()
        data = json.loads(input_data)
        
        return {
            'language_map': data['language_map'],
            'codigo_json': data['codigo_json'],
            'image_base64': data['image_base64'],
            'theme': data['theme'],
            'paginaId': data['paginaId']
        }
    except Exception as e:
        raise Exception(f"Error al cargar datos del backend: {str(e)}")

def base64_to_image(base64_string):
    """Convierte base64 a objeto Image de PIL (sin guardar en disco)"""
    try:
        image_data = base64.b64decode(base64_string)
        img = Image.open(BytesIO(image_data))
        return img
    except Exception as e:
        raise Exception(f"Error al convertir imagen: {str(e)}")

# FUNCIONES DE REINTENTOS


def retry_request(func, *args, max_retries=3, **kwargs):
    """Reintenta una función en caso de error"""
    for attempt in range(max_retries):
        try:
            return func(*args, **kwargs)
        except Exception as e:
            if attempt == max_retries - 1:
                raise
            print(f"Intento {attempt + 1} falló: {str(e)}. Reintentando...", file=sys.stderr)
    return None

# FUNCIONES DE GENERACIÓN CON IA

def createJson(prompt, img):
    """Crea un JSON con análisis de la página web usando Gemini (por la capacidad de visión)"""
    try:
        # Llamada a Gemini con búsqueda en Google (solo Gemini puede analizar imágenes)
        response = retry_request(
            client.models.generate_content,
            model='gemini-2.0-flash-exp',
            contents=[prompt, img],
            config=types.GenerateContentConfig(
                tools=[grounding_tool],
                response_modalities=["TEXT"],
                response_mime_type="application/json",
                response_schema=TableData
            )
        )
        
        # Parsear respuesta
        resultado_json = json.loads(response.text)
        return resultado_json
        
    except Exception as e:
        raise Exception(f"Error en createJson: {str(e)}")

def createImgSearching(conclusion_text):
    """Genera referencias de diseño mejorado usando OpenAI"""
    try:
        # Crear prompt para buscar referencias de diseño
        prompt = f"""
        Based on these website improvement suggestions:
        {conclusion_text}
        
        Search the web for modern website design examples and best practices that address these improvements.
        Provide specific design recommendations including:
        - Layout improvements
        - Typography suggestions
        - Color scheme recommendations
        - Navigation enhancements
        - Modern UI/UX patterns
        - Accessibility improvements
        
        Format your response as a detailed design guide with specific examples and references.
        """
        
        # Llamada a OpenAI (mejor para generar texto detallado)
        response = retry_request(
            clientChat.chat.completions.create,
            model="gpt-4o-mini",
            messages=[
                {
                    "role": "system",
                    "content": "You are an expert web designer and UX specialist. Provide detailed, actionable design recommendations based on current web design trends and best practices."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            temperature=0.7,
            max_tokens=2000
        )
        
        return response.choices[0].message.content
        
    except Exception as e:
        print(f"Warning: No se pudo generar referencia de diseño: {str(e)}", file=sys.stderr)
        return None

def createTxt(design_reference, conclusions_json, codigo_json, language_map):
    """Genera código mejorado basado en el análisis usando OpenAI"""
    try:
        # Extraer conclusiones del JSON
        conclusiones = []
        if 'rows' in conclusions_json:
            for row in conclusions_json['rows']:
                if 'row' in row and 'conclusion' in row['row']:
                    conclusiones.append(row['row']['conclusion'])
        
        conclusiones_text = "\n".join(conclusiones)
        
        # Crear prompt estructurado para OpenAI
        codigo_completo = "\n\n".join([
            f"// File: {archivo['name']} (Language: {language_map.get(archivo['name'], 'unknown')})\n{archivo['content']}" 
            for archivo in codigo_json
        ])
        
        prompt = f"""
        Eres un experto desarrollador web senior. Tu tarea es mejorar el siguiente código basándote en:
        
        SUGERENCIAS DE MEJORA:
        {conclusiones_text}
        
        GUÍA DE DISEÑO:
        {design_reference}
        
        CÓDIGO ACTUAL:
        {codigo_completo}
        
        REQUISITOS:
        1. Mantén exactamente la misma estructura de archivos y nombres
        2. Aplica todas las mejoras sugeridas de manera profesional
        3. Mejora la accesibilidad (ARIA labels, semantic HTML, contraste)
        4. Optimiza para SEO (meta tags, estructura semántica)
        5. Mejora la UX (navegación intuitiva, responsive design)
        6. Usa las mejores prácticas modernas de desarrollo web
        7. Mantén el mismo número de archivos
        8. Asegúrate de que el código sea limpio y bien comentado
        
        RESPONDE ÚNICAMENTE CON UN JSON VÁLIDO en este formato exacto:
        {{
            "archivos": [
                {{
                    "name": "nombre_del_archivo",
                    "language": "lenguaje_programacion",
                    "content": "código_mejorado_completo"
                }}
            ]
        }}
        
        NO agregues explicaciones fuera del JSON. Solo el JSON.
        """
        
        # Llamada a OpenAI (mejor para generar código)
        response = retry_request(
            clientChat.chat.completions.create,
            model="gpt-4o",
            messages=[
                {
                    "role": "system",
                    "content": "You are an expert full-stack web developer. You provide clean, modern, and optimized code following best practices. Always respond with valid JSON only."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            temperature=0.3,
            max_tokens=4000,
            response_format={ "type": "json_object" }
        )
        
        # Parsear respuesta
        codigo_mejorado = json.loads(response.choices[0].message.content)
        return codigo_mejorado
        
    except Exception as e:
        raise Exception(f"Error en createTxt: {str(e)}")

# FUNCIÓN PRINCIPAL

def main():
    """Función principal que procesa los datos del backend (desde stdin)"""
    
    try:
        # 1. Cargar datos del backend (desde stdin)
        backend_data = load_data_from_stdin()
        
        language_map = backend_data['language_map']
        codigo_json = backend_data['codigo_json']
        theme = backend_data['theme']
        pagina_id = backend_data['paginaId']
        
        # 2. Convertir imagen de base64 a PIL Image (sin guardar en disco)
        img = base64_to_image(backend_data['image_base64'])
        
        # 3. Crear análisis de la página con Gemini (necesita visión)
        prompt_analisis = f"""
        The JSON returned must be an array of 11 rows (objects).  
        Each row has in this order:  
        "criterion", "website1", "website2", "website3", "website4", "conclusion".
        
        Websites 1 to 3 have to be the most famous about {theme}, and the 4th is the one of the img inserted.
        
        Rules:  
        - Criteria order (rows): Typography & Readability, Colors & Branding, Visual Elements, 
          Navigation & UX, Organization & Structure, Accessibility, Functionality, Interactivity, 
          SEO, +1 extra criterion you choose, +Final Conclusion row (only fill "conclusion").
        - Website1–Website3 (columns): each = short intro phrase + one descriptive sentence of 20–30 words.
          Do not mention the Website in each cell.
        - Website4 (column): same, but refers to the website from the provided image.
        - "Conclusion" (column): only Website4 improvements, implicit comparison, highlight strengths + suggestions, 
          never mention website names.
        
        Try to use different words for the cells, so each criteria doesn't have the exact same words. 
        Use an extensive vocabulary.
        Output must be strictly consistent, 6 keys per row, no extra text. 
        And just should have 11 rows (without a "final" conclusion).
        
        The response must be in Spanish.
        """
        
        resultado_json = createJson(prompt_analisis, img)
        
        # 4. Generar referencia de diseño con OpenAI (mejor para texto)
        conclusions_text = "\n".join([
            row['row']['conclusion'] 
            for row in resultado_json.get('rows', []) 
            if 'row' in row and 'conclusion' in row['row']
        ])
        
        design_reference = createImgSearching(conclusions_text)
        
        # 5. Generar código mejorado con OpenAI (mejor para código)
        codigo_mejorado = createTxt(design_reference, resultado_json, codigo_json, language_map)
        
        # 6. Preparar resultado final
        resultado_final = {
            "success": True,
            "paginaId": pagina_id,
            "tabla_analisis": resultado_json,
            "codigo_mejorado": codigo_mejorado,
            "referencia_diseno": design_reference
        }
        
        # 7. Enviar resultado al backend (via stdout)
        return(json.dumps(resultado_final, ensure_ascii=False))
        
    except Exception as e:
        # En caso de error, enviar respuesta de error
        error_response = {
            "success": False,
            "error": str(e)
        }
        print(json.dumps(error_response, ensure_ascii=False), file=sys.stderr)
        sys.exit(1)

# PUNTO DE ENTRADA

if __name__ == "__main__":
    main()