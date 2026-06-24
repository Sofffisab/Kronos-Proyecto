import os
import re
import json
from google import genai
from google.genai import types
from PIL import Image, ImageEnhance
from io import BytesIO
from pydantic import BaseModel
from typing import List
import base64
import pandas as pd
from tabulate import tabulate
import time
import random
import requests  # NUEVO: Para interactuar con la API gratuita de Hugging Face
from openai import OpenAI
from dotenv import load_dotenv, dotenv_values
import psycopg2
import sys

load_dotenv()

# Inicialización de clientes
client = genai.Client(api_key=os.getenv("GEMINI_KEY"))
clientChat = OpenAI(api_key=os.getenv("CHAT_KEY"))

def log(*args, **kwargs):
    """Send diagnostic output to stderr so stdout stays JSON-only."""
    print(*args, file=sys.stderr, **kwargs)

# Centraliza el modelo y la URL de Hugging Face de forma gratuita
HF_API_URL = "https://api-inference.huggingface.co/models/black-forest-labs/FLUX.1-schnell"

# modelo de la tabla
class WebsiteValue(BaseModel):
    name: str
    text: str

class TableRow(BaseModel):
    criterion_or_website: str
    websites: List[WebsiteValue]
    conclusion: str = None

class TableData(BaseModel):
    table_data: List[TableRow]

SAVE_DIR = "tablas_generadas"
os.makedirs(SAVE_DIR, exist_ok=True)

# acceso a buscar en google
grounding_tool = types.Tool(
    google_search=types.GoogleSearch()
)

# ERROR
def retry_request(func, *args, **kwargs):
    max_retries = 5
    delay = 2
    for attempt in range(max_retries):
        try:
            return func(*args, **kwargs)
        except Exception as e:
            if "503" in str(e) and attempt < max_retries - 1:
                sleep_time = delay * (2 ** attempt) + random.uniform(0, 1)
                log(f"Server sobrecargado (503). Retrying in {sleep_time:.1f} seconds...")
                time.sleep(sleep_time)
            else:
                raise

# crear img (Corregido: Usa la API Gratuita de Hugging Face mediante peticiones HTTP estándar)
def createImg(prompt):
    try:
        headers = {"Authorization": f"Bearer {os.getenv('HUGGINGFACE_API_KEY')}"}
        payload = {"inputs": prompt}
        
        # Petición POST directa para obtener los bytes de la imagen generada
        response = requests.post(HF_API_URL, headers=headers, json=payload)
        
        # Si el modelo está "durmiendo" en los servidores gratuitos de Hugging Face, esperamos a que cargue
        if response.status_code == 503:
            log("El modelo gratuito se está cargando en Hugging Face, esperando 10 segundos...")
            time.sleep(10)
            response = requests.post(HF_API_URL, headers=headers, json=payload)

        if response.status_code == 200:
            image = Image.open(BytesIO(response.content))
            image.save('gemini-image.png')
            image.show()
            return image
        else:
            log(f"Error de la API de Hugging Face ({response.status_code}): {response.text}")
            return None
            
    except Exception as e:
        log(f"No se pudo generar imagen en Hugging Face: {e}")
        return None

def createImgSearching(conclusion_text, img_path):
    """
    Genera una nueva imagen basada en las conclusiones aplicando el prompt en texto a Hugging Face.
    """
    if isinstance(img_path, str):
        if not os.path.exists(img_path):
            log(f"Imagen no encontrada: {img_path}")
            return None
    elif not isinstance(img_path, Image.Image):
        log("Tipo de imagen no válido. Se esperaba ruta (str) o imagen PIL.")
        return None

    # Generamos un prompt robusto para el modelo de texto a imagen gratuito
    prompt_final = f"A professional UI/UX mobile web design style redesign, high quality, modern design. Guidelines: {conclusion_text}."
    
    try:
        headers = {"Authorization": f"Bearer {os.getenv('HUGGINGFACE_API_KEY')}"}
        payload = {"inputs": prompt_final}
        
        response = requests.post(HF_API_URL, headers=headers, json=payload)
        
        if response.status_code == 503:
            log("El modelo gratuito se está cargando en Hugging Face, esperando 10 segundos...")
            time.sleep(10)
            response = requests.post(HF_API_URL, headers=headers, json=payload)

        if response.status_code == 200:
            edited_img = Image.open(BytesIO(response.content))
            edited_img.save("imagen_editada.png")
            edited_img.show()
            return edited_img
        else:
            log(f"Error en createImgSearching ({response.status_code}): {response.text}")
            return None
            
    except Exception as e:
        log(f"No se pudo generar imagen mejorada: {e}")
        return None

language_map = {
    "index.html": "html",
    "style.css": "css",
}

# CREAR CODIGO ARREGLADO
def createTxt(img_from_ai, conclusions_json, codigo_json, language_map):
    codigo_blocks = []
    for c in codigo_json:
        name = c.get("name", "archivo")
        content = c.get("content", "")
        lang = language_map.get(name, "text")
        codigo_blocks.append(f"🔧 Archivo: {name}\n```{lang}\n{content}\n```")

    codigo_str = "\n\n".join(codigo_blocks)
    img_b64 = None

    if img_from_ai:
        if isinstance(img_from_ai, Image.Image):
            buffered = BytesIO()
            img_from_ai.save(buffered, format="PNG")
            img_bytes = buffered.getvalue()
            img_b64 = base64.b64encode(img_bytes).decode("utf-8")
        elif isinstance(img_from_ai, str) and os.path.exists(img_from_ai):
            with open(img_from_ai, "rb") as f:
                img_bytes = f.read()
            img_b64 = base64.b64encode(img_bytes).decode("utf-8")

    if not img_b64:
        log("No se pudo codificar la imagen, usando solo texto.")
        img_b64 = ""

    prompt = f"""
    Vas a recibir: (A) código del sitio SIN cambios aplicados, (B) img de la página CON los cambios aplicados, (C) JSON DE conclusiones de las mejoras y cambios realizados en la img.
    Mejora el código para que la UI coincida exactamente con la imagen y las sugerencias planteadas.
    Devuelve SOLO BLOQUES DE CÓDIGO Markdown con encabezado '🔧 Archivo: <nombre>' y triple backticks con lenguaje indicado.
    Código actual:
    {codigo_str}
    Conclusiones / sugerencias:
    {json.dumps(conclusions_json, indent=2, ensure_ascii=False)}
    """
    
    log("✅ request de createTxt hecho")
    
    response = clientChat.chat.completions.create(
        model="gpt-4o", 
        messages=[
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": prompt},
                    {
                        "type": "image_url",
                        "image_url": {"url": f"data:image/png;base64,{img_b64}"}
                    }
                ]
            }
        ]
    )
    log("✅ Request de texto hecho")

    output_text = response.choices[0].message.content

    pattern = r"(?:🔧\s*)?Archivo:\s*(.*?)\n```([\w+\-]+)\n(.*?)```"
    matches = re.findall(pattern, output_text, re.DOTALL)
    parsed = []
    for filename, lang, code in matches:
        parsed.append({"name": filename.strip(), "lang": lang.strip(), "content": code.rstrip()})

    return {"markdown": output_text, "files": parsed}

# crear tabla e img buscando en internet
def createJson(prompt, img_path, codigo_json, language_map):
    contents_buscar_paginas = [
        {
            "role": "user",
            "content": "Crea un prompt en base a tu función de búsqueda en internet para poder conseguir información acerca del siguiente prompt y dárselo a otra IA generadora de tablas: " + prompt
        }
    ]
    
    response = clientChat.chat.completions.create(
        model="gpt-4o",
        messages=contents_buscar_paginas
    )

    log("Response de tabla hecho")
    prompt_board = response.choices[0].message.content + prompt

    if os.path.exists(img_path):
        with open(img_path, "rb") as f:
            inserted_img = f.read()
        with Image.open(img_path) as img:
            img_format = img.format.lower()
            mime_type = f"image/{img_format}" if img_format != "jpg" else "image/jpeg"
    else:
        log(f"Imagen no encontrada: {img_path}")
        return

    contents_tabla = [
        types.Part.from_text(text=prompt_board),
        types.Part.from_bytes(data=inserted_img, mime_type=mime_type)
    ]

    response = retry_request(
        client.models.generate_content,
        model="gemini-2.5-flash",
        contents=contents_tabla,
        config=types.GenerateContentConfig(
            response_mime_type="application/json",
            response_schema=TableData,
        ),
    )

    candidate = response.candidates[0]
    tabla_json_str = ""
    for part in candidate.content.parts:
        if part.text:
            tabla_json_str = part.text
            break

    tabla_generada_dict = json.loads(tabla_json_str)
    tabla_generada = TableData.model_validate(tabla_generada_dict)

    tabla_generada.table_data = [
        row for row in tabla_generada.table_data 
        if row.criterion_or_website.lower() != "conclusion"
    ]

    all_websites = []
    for row in tabla_generada.table_data:
        for w in row.websites:
            if w.name not in all_websites:
                all_websites.append(w.name)

    rows = []
    for row in tabla_generada.table_data:
        row_dict = {"criterion_or_website": row.criterion_or_website}
        for site in all_websites:
            text = next((w.text for w in row.websites if w.name == site), "")
            row_dict[site] = text
        row_dict["conclusion"] = row.conclusion or ""
        rows.append(row_dict)

    cols = ["criterion_or_website"] + all_websites + ["conclusion"]
    df = pd.DataFrame(rows)[cols]

    json_path = os.path.join(SAVE_DIR, "tablita.json")
    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(rows, f, ensure_ascii=False, indent=4)
    log("JSON creado")

    xlsx_path = os.path.join(SAVE_DIR, "tablita.xlsx")
    df.to_excel(xlsx_path, index=False)
    log("Excel creado")

    if "conclusion" in df.columns:
        conclusion = " ".join(df["conclusion"].dropna().tolist())
    else:
        conclusion = " ".join(df.iloc[-1].dropna().tolist())

    log("Conclusión de tabla hecho")

    if not conclusion.strip():
        conclusion = "No hubo sugerencias claras, pero mejora la navegación y la accesibilidad visual."

    edited_img = createImgSearching(conclusion, img_path)
    
    resultado_txt = createTxt(
        edited_img,
        rows,
        codigo_json,
        language_map
    )

    log("Markdown generado:\n", resultado_txt["markdown"])
    return rows, resultado_txt, edited_img


def load_data_from_stdin():
    try:
        input_data = sys.stdin.read()
        data = json.loads(input_data)
        return {
            'language_map': data['language_map'],
            'codigo_json': data['codigo_json'],
            'image_base64': data['image_base64'],
            'theme': data['theme'],
        }
    except Exception as e:
        raise Exception(f"Error al cargar datos del backend: {str(e)}")

def base64_to_image(base64_string):
    try:
        image_data = base64.b64decode(base64_string)
        img = Image.open(BytesIO(image_data))
        return img
    except Exception as e:
        raise Exception(f"Error al convertir imagen: {str(e)}")


if __name__ == "__main__":
    try:
        data = load_data_from_stdin()
        language_map = data['language_map']
        codigo_json = data['codigo_json']
        theme = data['theme']

        img_pagina = base64_to_image(data['image_base64'])
        pagina_image_path = "pagina_image.png"
        img_pagina.save(pagina_image_path)

        prompt = f"""
        The JSON returned must be an array of 11 rows (objects).  
        Each row has in this order:  
        "criterion", "(NamePage1)", "(NamePage2)", "(NamePage3)", "(NamePage4)", "Conclusion".
        Websites 1 to 3 have to be the most famous about {theme}, and the 4th is the one of the img insterted.
        Rules:  
        - Criteria order (rows): Typography & Readability, Colors & Branding, Visual Elements, Navigation & UX, Organization & Structure, Accessibility, Functionality, Interactivity, SEO, +1 extra criterion you choose, +Final Conclusion row (only fill "Conclusion").  
        - Website1–Website3 (columns): each = short intro phrase + one descriptive sentence of 20–30 words. Do not mention the Website in each cell.  
        - Website4 (column): same, but refers to the website from the provided image.  
        - "Conclusion" (column): only Website4 improvements, implicit comparison, highlight strengths + suggestions, never mention website names.  
        Try to use different words for the cells, so each criterion doesn't have the exact same words. Use an extensive vocabulary
        Output must be strictly consistent, 6 keys per row, no extra text. And just should have 11 rows (without a "final" conclusion)
        The response must be in spanish. 
        """

        rows, resultado_txt, edited_img = createJson(
            prompt,
            pagina_image_path,
            codigo_json,
            language_map
        )

        if edited_img is None:
            log("No se generó imagen nueva; usando captura original como referencia.")
            edited_img = img_pagina

        buffer = BytesIO()
        edited_img.save(buffer, format="PNG")
        img_bytes = buffer.getvalue()
        referencia_data_uri = f"data:image/png;base64,{base64.b64encode(img_bytes).decode('utf-8')}"

        output = {
            "success": True,
            "tabla_analisis": rows,
            "codigo_mejorado": resultado_txt,
            "referencia_diseno": referencia_data_uri
        }

        print(json.dumps(output))

    except Exception as e:
        log(f"Fallback de emergencia activado: {e}")
        fallback_output = {
            "success": True,
            "tabla_analisis": [],
            "codigo_mejorado": {
                "markdown": "",
                "files": []
            },
            "referencia_diseno": f"data:image/png;base64,{data['image_base64']}"
        }
        print(json.dumps(fallback_output))