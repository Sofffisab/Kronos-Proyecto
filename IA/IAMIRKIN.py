# pip install -r lib.txt --no-warn-script-location
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
import json
import time
import random
from openai import OpenAI
from dotenv import load_dotenv, dotenv_values
import psycopg2
import sys


load_dotenv()

client = genai.Client(api_key=os.getenv("GEMINI_KEY"))
clientChat = OpenAI(api_key=os.getenv("CHAT_KEY"))
#DATABASE_URL = os.getenv("DATABASE_URL")

# Conectarse a la base de datos
"""
try:
    conn = psycopg2.connect(DATABASE_URL)
    cursor = conn.cursor()

    cursor.execute("SELECT version();")
    version = cursor.fetchone()
    print("Conectado a:", version)

    cursor.close()
    conn.close()
    print("Conexión cerrada correctamente.")

except Exception as e:
    print("Error al conectar:", e)
    """




#modelo de la tabla
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

#acceso a buscar en google
grounding_tool = types.Tool(
    google_search=types.GoogleSearch()
)

#ERROR
def retry_request(func, *args, **kwargs):
    max_retries = 5
    delay = 2
    for attempt in range(max_retries):
        try:
            return func(*args, **kwargs)
        except genai.errors.ServerError as e:
            if "503" in str(e) and attempt < max_retries - 1:
                sleep_time = delay * (2 ** attempt) + random.uniform(0, 1)
                print(f"Server sobrecargado (503). Retrying in {sleep_time:.1f} seconds...")
                time.sleep(sleep_time)
            else:
                raise

#crear img
def createImg(prompt):
    response = retry_request(
        client.models.generate_content,
        model="gemini-2.0-flash-preview-image-generation",
        contents=[
            {"role": "user", "parts": [{"text": prompt}]}
        ],
        config=types.GenerateContentConfig(
        response_modalities=['TEXT', 'IMAGE']
        )
    )
    for part in response.candidates[0].content.parts:
        if part.text is not None:
            print(part.text)
        elif part.inline_data is not None:
            image = Image.open(BytesIO((part.inline_data.data)))
            image.save('gemini-image.png')
            image.show()


def createImgSearching(conclusion_text, img_path):
    """
    Genera una nueva imagen basada en img_path aplicando únicamente las mejoras de conclusion_text.
    """
        # --- Detectar tipo de input ---
    if isinstance(img_path, str):
        # Es una ruta de archivo
        if not os.path.exists(img_path):
            print(f"Imagen no encontrada: {img_path}")
            return None
        img = Image.open(img_path).convert("RGB")

    elif isinstance(img_path, Image.Image):
        # Es una imagen ya cargada (por ejemplo, resultado de una generación anterior)
        img = img_path.convert("RGB")

    else:
        print("Tipo de imagen no válido. Se esperaba ruta (str) o imagen PIL.")
        return None


    # Reducir resolución si es muy grande (mejor interpretación de layout)
    target_width = 1280
    if img.width > target_width:
        new_height = int(target_width * img.height / img.width)
        img = img.resize((target_width, new_height), Image.LANCZOS)

    # Mejorar color y contraste (facilita detección de secciones)
    img = ImageEnhance.Color(img).enhance(1.15)
    img = ImageEnhance.Contrast(img).enhance(1.1)

    # Guardar imagen preprocesada temporalmente
    preprocessed_path = "preprocesada.png"
    img.save(preprocessed_path)

    with open(preprocessed_path, "rb") as f:
        img_bytes = f.read()

    mime_type = "image/png"
    width, height = img.size

    # Generar prompt dinámico según creatividad
    prompt_final = f"""
    Rediseñá visualmente esta página web para hacerla mucho más atractiva, moderna y creativa,
    manteniendo el propósito general de la interfaz pero reinterpretando libremente su estilo visual.
    
    ✦ Podés reacomodar la disposición de los elementos, cambiar proporciones, jugar con espacios vacíos.
    ✦ Usá una paleta de colores equilibrada, con contraste claro y buena legibilidad.
    ✦ Incorporá ideas actuales de diseño UI/UX (2025): sombras suaves, degradados, glassmorphism, neón o minimalismo moderno.
    ✦ Tipografía limpia y legible; nada de símbolos o letras irreconocibles.
    ✦ Si el sitio parece de tecnología o mercado (por ejemplo, "PC Market"), dale un estilo tech-futurista con energía visual.
    ✦ Evitá deformar textos existentes; mantenelos realistas y legibles
    
    Tené en cuenta lo siguiente para guiar el rediseño:
    {conclusion_text}
    
    """
    
    # Generar imagen
    response_img = client.models.generate_content(
        model="gemini-2.0-flash-preview-image-generation",
        contents=[
            types.Part.from_text(text=prompt_final),
            types.Part.from_bytes(data=img_bytes, mime_type=mime_type)
        ],
        config=types.GenerateContentConfig(
        response_modalities=["TEXT", "IMAGE"],
        temperature=0.8,
        top_p=0.95
        )
    )

    # Extraer imagen generada
    for part in response_img.candidates[0].content.parts:
        if part.inline_data:
            edited_img = Image.open(BytesIO(part.inline_data.data))
            edited_img.save("imagen_editada.png")
            edited_img.show()
            return edited_img


language_map = {
    "index.html": "html",
    "style.css": "css",
}


#CREAR CODIGO ARREGLADO
def createTxt(img_from_ai,conclusions_json, codigo_json, language_map):
    """
    img_from_ai: ruta a la imagen generada
    conclusions_json: JSON con conclusiones/sugerencias
    codigo_json: lista de dicts con "name" y "content"
    language_map: dict que indica lenguaje de cada archivo, ej:
                  {"index.html": "html", "style.css": "css", "script.js": "javascript"}
    """

    codigo_blocks = []
    for c in codigo_json:
        # Cada c debe tener al menos "name" y "content"
        name = c.get("name", "archivo")
        content = c.get("content", "")
        lang = language_map.get(name, "text")  # usa el lenguaje definido por usuario, sino "text"
        codigo_blocks.append(f"🔧 Archivo: {name}\n```{lang}\n{content}\n```")

    codigo_str = "\n\n".join(codigo_blocks)


    # Preparar contents para el prompt
    img_b64 = None

    if isinstance(img_from_ai, str):
        if img_from_ai.startswith("data:image"):
            img_b64 = img_from_ai.split(",", 1)[1]
        elif len(img_from_ai) > 1000:
            img_b64 = img_from_ai


    # Preparar contents para el prompt
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

    # Si no se pudo obtener la imagen
    if not img_b64:
        print("No se pudo codificar la imagen, usando solo texto.")
        img_b64 = ""  # Evita el UnboundLocalError

    prompt = f"""
    Vas a recibir: (A) código del sitio SIN cambios aplicados, (B) img de la página CON los cambios aplicados, (C) JSON DE conclusiones de las mejoras y cambios realizados en la img.
    Mejora el código para que la UI coincida exactamente con la imagen y las sugerencias planteadas.
    Devuelve SOLO BLOQUES DE CÓDIGO Markdown con encabezado '🔧 Archivo: <nombre>' y triple backticks con lenguaje indicado.
    Código actual:
    {codigo_str}
    Conclusiones / sugerencias:
    {json.dumps(conclusions_json, indent=2, ensure_ascii=False)}
    """
    
    print("✅ request de createTxt hecho")
    # Llamada al modelo
    response = clientChat.responses.create(
        model="gpt-5",
        tools=[{"type": "web_search"}],
        input=[
            {
                "role": "user",
                "content": [
                    {
                        "type": "input_text",
                        "text": (prompt)
                    },
                    {
                        "type": "input_image", 
                        "image_url": img_b64 if img_b64.startswith("data:image") else f"data:image/png;base64,{img_b64}"
                    }
                    ]
        }]
    )
    print("✅Request de texto hecho")

    output_text = response.output_text

    # Parse bloques
    pattern = r"(?:🔧\s*)?Archivo:\s*(.*?)\n```([\w+\-]+)\n(.*?)```"
    matches = re.findall(pattern, output_text, re.DOTALL)
    parsed = []
    for filename, lang, code in matches:
        parsed.append({"name": filename.strip(), "lang": lang.strip(), "content": code.rstrip()})

    return {"markdown": output_text, "files": parsed}


#crear tabla e img buscando en internet
def createJson(prompt, img_path, codigo_json, language_map):

    contents_buscar_paginas = [
    {
        "role": "user",
        "content": [
            {
                "type": "input_text",
                "text": (
                    "Crea un prompt en base a tu función de búsqueda en internet para poder conseguir información "
                    "acerca del siguiente prompt y dárselo a otra IA generadora de tablas: " + prompt
                )
            }
        ]
    }
]

    
    response = clientChat.responses.create(
        model="gpt-5",
        tools=[{"type": "web_search"}],
        input=contents_buscar_paginas
    )

    print("Response de tabla hecho")

    prompt_board = response.output_text + prompt

    if os.path.exists(img_path):
        with open(img_path, "rb") as f:
            inserted_img = f.read()
        with Image.open(img_path) as img:
            img_format = img.format.lower()
            mime_type = f"image/{img_format}" if img_format != "jpg" else "image/jpeg"
    else:
        print(f"Imagen no encontrada: {img_path}")
        return



    contents_tabla = [
        {
            "role":"user",
            "parts": [
                types.Part.from_text(text=prompt_board),
                types.Part.from_bytes(data=inserted_img, mime_type=mime_type)
            ]
        }
    ]


 #hacer tablita
    response = retry_request(
        client.models.generate_content,
        model="gemini-2.5-flash",
        contents=contents_tabla,
        config={
            "response_mime_type": "application/json",
            "response_schema": TableData.model_json_schema()
        },
    )

    # Tomamos el primer candidato
    candidate = response.candidates[0]

    # Recorremos las partes del contenido
    for part in candidate.content.parts:
        if part.text:
            tabla_json_str = part.text  # Aquí tenemos el JSON como string
            break

    # Parseamos a dict
    tabla_generada_dict = json.loads(tabla_json_str)

    # Convertimos a Pydantic
    tabla_generada = TableData.model_validate(tabla_generada_dict)

    # Filtrar fila de final conclusion
    tabla_generada.table_data = [
        row for row in tabla_generada.table_data 
        if row.criterion_or_website.lower() != "conclusion"
    ]



 #ajustar los datos a las filas y columnas
    all_websites = []
    for row in tabla_generada.table_data:
        for w in row.websites:
            if w.name not in all_websites:
                all_websites.append(w.name)

    # 2. Construir filas por criterio
    rows = []
    for row in tabla_generada.table_data:
        row_dict = {"criterion_or_website": row.criterion_or_website}
        for site in all_websites:
            text = next((w.text for w in row.websites if w.name == site), "")
            row_dict[site] = text
        # Solo Website4 es la “conclusion” de mejoras
        row_dict["conclusion"] = row.conclusion or ""
        rows.append(row_dict)


    # 3. Crear DataFrame con columnas fijas
    cols = ["criterion_or_website"] + all_websites + ["conclusion"]
    df = pd.DataFrame(rows)[cols]





    # Guardar JSON
    json_path = os.path.join(SAVE_DIR, "tablita.json")
    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(rows, f, ensure_ascii=False, indent=4)
    print("JSON creado")

    with open("tablas_generadas/tablita.json", "r", encoding="utf-8") as f:
        data = json.load(f)

    print("tabla guardada")

    # Guardar Excel
    xlsx_path = os.path.join(SAVE_DIR, "tablita.xlsx")
    df.to_excel(xlsx_path, index=False)
    print("Excel creado")

    #por si cambiamos de lugar las filas y columnas 
    conclusion = None
    if "conclusion" in df.columns:
        conclusion = " ".join(df["conclusion"].dropna().tolist())
    else:
        conclusion = " ".join(df.iloc[-1].dropna().tolist())

    print("Conclusión de tabla hecho")

    if not conclusion.strip():
        conclusion = "No hubo sugerencias claras, pero mejora la navegación y la accesibilidad visual."

    edited_img = createImgSearching(conclusion, img_path)
    
    resultado_txt = createTxt(
        edited_img,
        rows,
        codigo_json,
        language_map
    )

    print("Markdown generado:\n", resultado_txt["markdown"])
    return rows, resultado_txt, edited_img


def load_data_from_stdin():
    """Lee datos JSON del stdin y devuelve un diccionario."""
    try:
        input_data = sys.stdin.read()
        data = json.loads(input_data)
        return {
            'language_map': data['language_map'],
            'codigo_json': data['codigo_json'],
            'image_base64': data['image_base64'],
            'theme': data['theme'],
            'paginaId': data.get('paginaId'),
        }
    except Exception as e:
        raise Exception(f"Error al cargar datos del backend: {str(e)}")

def base64_to_image(base64_string):
    """Convierte una cadena Base64 a una imagen PIL."""
    try:
        from io import BytesIO
        import base64
        image_data = base64.b64decode(base64_string)
        img = Image.open(BytesIO(image_data))
        return img
    except Exception as e:
        raise Exception(f"Error al convertir imagen: {str(e)}")

# (Se asume que las funciones createImgSearching, createTxt y createJson
#  están definidas en este mismo script o importadas adecuadamente,
#  y que code_json y language_map vienen del input.)

if __name__ == "__main__":
    try:
        # --- Leer entrada ---
        data = load_data_from_stdin()
        language_map = data['language_map']
        codigo_json = data['codigo_json']
        theme = data['theme']
        paginaId = data['paginaId']

        # --- Procesar imagen ---
        img_pagina = base64_to_image(data['image_base64'])
        pagina_image_path = "pagina_image.png"
        img_pagina.save(pagina_image_path)

        # --- Generar tabla, código y diseño ---
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

        # CORRECTO: esta es la única llamada a createJson
        rows, resultado_txt, edited_img = createJson(
            prompt,
            pagina_image_path,
            codigo_json,
            language_map
        )

        # Convertir imagen editada a Base64
        buffer = BytesIO()
        edited_img.save(buffer, format="PNG")
        img_bytes = buffer.getvalue()
        referencia_data_uri = f"data:image/png;base64,{base64.b64encode(img_bytes).decode('utf-8')}"

        # --- Preparar salida JSON para el backend ---
        output = {
            "success": True,
            "paginaId": paginaId,
            "tabla_analisis": rows,
            "codigo_mejorado": resultado_txt,
            "referencia_diseno": referencia_data_uri
        }

        print(json.dumps(output))

    except Exception as e:
        error_output = {
            "success": False,
            "error": str(e)
        }
        print(json.dumps(error_output))
        sys.exit(1)