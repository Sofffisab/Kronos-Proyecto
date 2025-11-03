import os
from services.gemini_client import client, retry_request
from services.image_tools import createImgSearching
from services.text_tools import createTxt
from utils.helpers import save_json, save_excel




def createJson(prompt: str, img_path: str = "data/recursos/image.jpg", codigo_json=None, language_map=None):
    """Función que implementa el pipeline: genera prompt de búsqueda, pide tabla a Gemini, parsea
    a DataFrame, guarda JSON/XLSX, genera imagen editada y luego solicita al LLM el código ajustado.


    Retorna el resultado del createTxt (markdown + files).
    """
    if codigo_json is None:
        codigo_json = []
    if language_map is None:
        language_map = {}


    # 1) Pedir a Gemini que cree un prompt de búsqueda (tu paso original)
    contents_buscar_paginas = [
    {"role": "user", "parts": [types.Part.from_text(text=(
    "Crea un prompt en base a tu función de búsqueda en internet para poder conseguir información acerca del siguiente prompt y dárselo a otra IA generadora de tablas: " + prompt
    ))]}
    ]


    response = retry_request(
        client.models.generate_content,
        model=GEMINI_TABLE_MODEL,
        contents=contents_buscar_paginas,
        config=types.GenerateContentConfig()
        )
    print("Response de tabla hecho")


    prompt_board = getattr(response, "text", "") + "\n" + prompt


    # 2) Leer imagen (si existe)
    if not os.path.exists(img_path):
        raise FileNotFoundError(f"Imagen no encontrada: {img_path}")


    with open(img_path, "rb") as f:
        inserted_img = f.read()
    with Image.open(img_path) as img:
        img_format = img.format.lower()
    mime_type = f"image/{'jpeg' if img_format=='jpg' else img_format}"


    contents_tabla = [
    {"role": "user", "parts": [
    types.Part.from_text(text=prompt_board),
    types.Part.from_bytes(data=inserted_img, mime_type=mime_type)
    ]}
    ]


    # 3) Solicitar tabla a Gemini con schema JSON
    response = retry_request(
    client.models.generate_content,
    model=GEMINI_TABLE_MODEL,
    contents=contents_tabla,
    config={
    "response_mime_type": "application/json",
    "response_schema": TableData.model_json_schema()
    }
    )


    candidate = response.candidates[0]


    tabla_json_str = None
    for part in candidate.content.parts:
        if getattr(part, "text", None):
            tabla_json_str = part.text
            break


    if not tabla_json_str:
        raise ValueError("No se recibió JSON de la respuesta de Gemini")


    tabla_generada_dict = json.loads(tabla_json_str)
    tabla_generada = Tabl