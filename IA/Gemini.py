# pip install -r lib.txt --no-warn-script-location
import os
import re
import json
from google import genai
from google.genai import types
from PIL import Image
from io import BytesIO
from pydantic import BaseModel
from PIL import Image
from typing import List
import base64
import pandas as pd
import datetime
from tabulate import tabulate
import json
import time
import random
from openai import OpenAI
from dotenv import load_dotenv, dotenv_values 

load_dotenv()

client = genai.Client(api_key=os.getenv("GEMINI_KEY"))
clientChat = OpenAI(api_key=os.getenv("CHAT_KEY"))

#modelo de la tabla
class WebsiteValue(BaseModel):
    name: str

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
            image.save('gemini-image.png', overwrite= True)
            image.show()

codigo_json = [
    {
        "name": "index.html",
        "content": """
        <!DOCTYPE html>
        <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Inicio</title>
                <link rel="stylesheet" href="style.css">
                <script src="https://cdnjs.cloudflare.com/ajax/libs/socket.io/4.7.4/socket.io.js"></script>
                <script src="../../socket.js"></script>
                <script type="module" src="script.js" defer></script>
                <link rel="preconnect" href="https://fonts.googleapis.com">
                <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
                <link href="https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap" rel="stylesheet">
                <link rel="preconnect" href="https://fonts.googleapis.com">
                <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
                <link href="https://fonts.googleapis.com/css2?family=Crimson+Text:ital,wght@0,400;0,600;0,700;1,400;1,600;1,700&display=swap" rel="stylesheet">
                <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" />
            </head>
            <body>

                <div class="inicio">
                    <header>
                        <img src="../../recursos/img/logo.png">
                        <div class="buscador">
                            <input type="text" class="busc" id="input1" placeholder="Buscar">
                            <div class="busqs" id="busq1"></div>
                        </div>
                        <nav>
                            <button class="info" onclick="location.href='../informacion/index.html'">Información</button>
                            <button class="armar" onclick="location.href='../armar-pc/index.html'">Arma tu PC</button>
                            <button class="comparar" onclick="location.href='../comparacion/index.html'">Comparar</button>
                            <button class="log" id="persona"><img src="../../recursos/img/personita.png"></button>
                        </nav>
                    </header>
                
                    <section>
                        <h1>Bienvenido a <img class="pcity" src="../../recursos/img/pcity.png"></h1>
                        <h2>Armá, compará y aprendé</h2>
                    </section>
                
                    <p>Componentes populares</p>
                    <div class="componentesPopu">
                    </div>
                </div>
            </body>
        </html>
        """
            },
            {
                "name": "style.css",
                "content": """
        body{
            margin: 0%;
            padding: 0%;
            height: 100vh;
            width: 100vw;
            overflow-x: hidden;
        }

        .inicio{
            width: 100%;
            height: 100%;
        }

        header{
            height: 15%;
            width: 100%;
            background-color: #101E35;
            z-index: -1;
            margin-top: 0%;
            display: flex;
            justify-content: space-between;
        }

        nav{
            width: 45%;
            display: flex;
            align-items: center;
            justify-content: space-between;
        }

        .armar,.comparar,.info,.log{
            font-family: "Inter", sans-serif;
            font-optical-sizing: auto;
            font-weight: 600;
            font-size: 1.5rem;
            background-color: transparent;
            border: none;
            color: #A6A6A6;
            margin-right: 3%;
            transition: 0,3s ease;
        }

        .busc{
            height: 45px;
            width: 100%;
            border-radius: 12px;
            margin-top: 3%;
            border: solid;
            border-color: #103263;
            border-width: 3px;
            font-size: larger;
            background-color: white;
            font-family: 'crimson text';
            font-weight: 500;
        }

        .busc::placeholder{
            color: #D9D9D9;
            background-image: url(../../recursos/img/lupa.buscador.png);
            background-size: 20px;
            background-repeat: no-repeat;
            background-position: left 2px center;
            padding-left: 27px;
        }

        .busc:focus{
            outline: none;
        }

        .buscador{
            display: flex;
            flex-direction: column;
            position: absolute;
            left: 12%;
        }

        .busqs{
            width: 557px;
            background-color: white;
            border-radius: 0 0 10px 10px;
            font-family: 'crimson text', serif;
            font-weight: 500;
            position: relative;
        }

        .busqs div {
            padding: 10px;
            cursor: pointer;
            border-bottom: 1px solid #e9e9e9;
            background-color: transparent;
            transition: background-color 0.2s ease;
        }

        .busqs div:hover {
            background-color: #f0f0f0;
        }

        section{
            height: 35%;
            width: 100%;
            background-image: url(../../recursos/img/fondo.png);
            background-color: #103263;
            background-size: cover;
            margin-top: 0%;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
        }

        section h1{
            font-family: 'inter';
            font-weight: bolder;
            font-size: 5rem;
            margin-top: -1%;
            margin-left: 16%;
            width: 60%;
            display: flex;
        }

        section h2{
            font-family: 'inter';
            margin-top: -5%;
            font-size: 2.5rem;
            font-style: bold;
        }

        .componentesPopu{
            display: flex;
            flex-wrap: wrap;
            justify-content: space-evenly;
            gap:10px;
        }
    """
    }
]

def createImgSearching(prompt, img_path=None):

    #para conseguir los tamaños de la img del input y respetarlos
    if img_path and os.path.exists(img_path):
        with Image.open(img_path) as img:
            inserted_img = img.tobytes()
            width, height = img.size


    prompt_search = f"""
    Analiza el sitio web mostrado en la imagen adjunta y describe mejoras visuales posibles.
    Considera tipografía, colores, distribución de botones, experiencia de usuario y coherencia visual.
    Devuelve una breve descripción textual del estilo ideal para rediseñarlo.
    Tema o contexto: {prompt}"""

 # Verifica que haya imagen y se agrega
    if img_path and os.path.exists(img_path):
        with open(img_path, "rb") as f:
            img_bytes = f.read()
        #se transforma la img en un objeto
        img_b64 = base64.b64encode(img_bytes).decode("utf-8")

 # Busca info en internet
    response = clientChat.responses.create(
        model="gpt-5",
        tools=[{"type": "web_search"}],
        input=prompt_search
    )
    print("Response de img hecho")

    prompt_img_inicial = f"""
    Crea una nueva imagen del sitio web mostrado en la imagen adjunta, incorporando las mejoras indicadas en la conclusión:
    - Ajustar paleta de colores y tipografía para mejor legibilidad.
    - Reorganizar botones importantes para navegación más intuitiva.
    - Añadir iconos y elementos visuales que mejoren la experiencia.
    - Mantener el estilo general del sitio original.
    - Mantener el mismo tamaño y proporción que la imagen original: ancho={width}px, alto={height}px.
    - Cualquier cambio que sea positivo
    """

    prompt_img_final = prompt_img_inicial + response.output_text


    # Generar img final
    response_img = retry_request(
        client.models.generate_content,
        model="gemini-2.0-flash-preview-image-generation",
        contents=[
            types.Part.from_text(text=prompt_search),
            types.Part.from_data(
                mime_type="image/jpeg",
                data=base64.b64decode(img_b64)
            )
        ],
        config=types.GenerateContentConfig(
            response_modalities=["TEXT", "IMAGE"]
        )
    )

    if response_img.candidates and response_img.candidates[0].content:
        for part in response_img.candidates[0].content.parts:
            if part.text is not None:
                print("img lista ñeri")
            elif part.inline_data is not None:
                image = Image.open(BytesIO(part.inline_data.data))
                image.save("gemini-image.png", overwrite=True)
                image.show()
                return(image)
    else:
        print("No se generó ninguna imagen para este prompt.")



language_map = {
    "index.html": "html",
    "style.css": "css",
}

#crear img buscando en internet
#def createImgSearching(prompt, img_path=None):
    """
    Genera una imagen rediseñada y devuelve su base64 (string).
    No guarda archivos, lista para mandar al backend.
    """
    width = height = None
    img_b64_input = None

    # Si hay imagen base
    if img_path and os.path.exists(img_path):
        with Image.open(img_path) as img:
            width, height = img.size
        with open(img_path, "rb") as f:
            img_b64_input = base64.b64encode(f.read()).decode("utf-8")

    prompt_search = f"""
    Analiza el sitio web mostrado en la imagen adjunta y describe mejoras visuales posibles.
    Considera tipografía, colores, distribución de botones, experiencia de usuario y coherencia visual.
    Devuelve una breve descripción textual del estilo ideal para rediseñarlo.
    Tema o contexto: {prompt}.
    """

    response = clientChat.responses.create(
        model="gpt-5",
        tools=[{"type": "web_search"}],
        input=prompt_search
    )
    print("Response de img hecho")

    prompt_img_final = f"""
    Crea una nueva imagen del sitio web mostrado en la imagen adjunta, incorporando las mejoras indicadas:
    - Ajustar paleta de colores y tipografía para mejor legibilidad.
    - Reorganizar botones importantes para navegación más intuitiva.
    - Añadir iconos y elementos visuales que mejoren la experiencia.
    - Mantener el estilo general del sitio original.
    - Mantener el mismo tamaño y proporción que la imagen original ({width}px x {height}px).
    """ + "\nConclusión: " + response.output_text

    response_img = retry_request(
        client.models.generate_content,
        model="gemini-2.0-flash-preview-image-generation",
        contents=[
            types.Part.from_text(text=prompt_img_final),
            types.Part.from_bytes(
                mime_type="image/jpeg",
                data=base64.b64decode(img_b64_input)
            ) if img_b64_input else types.Part.from_text("No se adjuntó imagen base.")
        ],
        config=types.GenerateContentConfig(response_modalities=["TEXT", "IMAGE"])
    )

    print("img lista ñeri")

    # 🧩 Verificación de respuesta
    if not response_img:
        print("⚠️ response_img es None (error interno o timeout en retry_request)")
        return None

    if not hasattr(response_img, "candidates") or not response_img.candidates:
        print("⚠️ Gemini no devolvió candidatos de imagen válidos.")
        print(response_img)
        return None

    if not hasattr(response_img.candidates[0], "content") or response_img.candidates[0].content is None:
        print("⚠️ Gemini devolvió contenido vacío en el candidato 0.")
        print(response_img)
        return None

    # 🧠 Si todo está bien, seguimos con el parseo
    img_b64 = None
    for i, part in enumerate(response_img.candidates[0].content.parts):
        print(f"Parte {i}: {type(part)}")
        if hasattr(part, "inline_data"):
            data = getattr(part.inline_data, "data", None)
            if data:
                if isinstance(data, bytes):
                    img_b64 = base64.b64encode(data).decode("utf-8")
                elif isinstance(data, str):
                    img_b64 = data
                break

    if not img_b64:
        print("⚠️ No se encontró imagen generada dentro del contenido.")
        print(response_img)
        return None

        print("✅ Imagen generada y codificada en base64 correctamente.")
        print(f"Primeros 100 caracteres del base64: {img_b64[:100]}...")
        return img_b64




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

    if isinstance(img_from_ai, str) and len(img_from_ai) > 1000:
    # Ya es base64 directamente
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
    
    print("✅ request armado ok")
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
    print(response.output_text)

    output_text = response.output_text

    # Parse bloques
    pattern = r"Archivo:\s*(.*?)\n```([\w+-]+)\n(.*?)```"
    matches = re.findall(pattern, output_text, re.DOTALL)
    parsed = []
    for filename, lang, code in matches:
        parsed.append({"name": filename.strip(), "lang": lang.strip(), "content": code.rstrip()})

    return {"markdown": output_text, "files": parsed}


#crear tabla e img buscando en internet
def createJson(prompt, img_path="image.jpg"):

    contents_buscar_paginas = [
         {
            "role": "user",
            "parts": [
                types.Part.from_text(text=(
                    "Crea un prompt en base a tu función de búsqueda en internet para poder conseguir información acerca del siguiente prompt y dárselo a otra IA generadora de tablas: "
                    + prompt
                    ))
            ]
        }
    ]
    
    response = retry_request(
        client.models.generate_content,
        model="gemini-2.5-flash",
        contents=contents_buscar_paginas,
        config = types.GenerateContentConfig(
            tools=[grounding_tool]
        )
    )
    print("Response de tabla hecho")

    prompt_board = response.text + prompt

    if os.path.exists(img_path):
        with open(img_path, "rb") as f:
            inserted_img = f.read()
    else:
        print(f"Imagen no encontrada: {img_path}")
        return



    contents_tabla = [
        {
            "role":"user",
            "parts": [
                types.Part.from_text(text=prompt_board),
                types.Part.from_bytes(data=inserted_img, mime_type="image/jpeg")
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
            "response_schema": TableData
        },
    )


 #ajustar los datos a las filas y columnas
    rows = []
    for row in response.parsed.table_data:
        row_dict = row.model_dump()
        websites_raw = row_dict.get("websites", [])
        websites_dict = {w["name"]: "" for w in websites_raw}
        row_dict.pop("websites", None)
        row_dict.update(websites_dict)
        rows.append(row_dict)


        

    df = pd.DataFrame(rows)
    
    #para que vaya la columna de conclusion al final
    cols = [col for col in df.columns if col != "conclusion"] + ["conclusion"]
    df = df[cols]

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

    if img_path and os.path.exists(img_path):
        imagen_creada = createImgSearching(conclusion,img_path)

    conclusion_text = " ".join(df["conclusion"].dropna().tolist())

    resultado_txt = createTxt(imagen_creada,rows,codigo_json,language_map)

    print("Markdown generado:\n", resultado_txt["markdown"])





theme = 'PC MARKET'

createJson(f"""
The JSON returned must be an array of 11 rows (objects).  
Each row has in this order:  
"criterion", "(NamePage1)", "(NamePage2)", "(NamePage3)", "(NamePage4)", "Conclusion".
Websites 1 to 3 have to be the most famous about {theme}, and the 4th is the one of the img insterted.
Rules:  
- Criteria order: Typography & Readability, Colors & Branding, Visual Elements, Navigation & UX, Organization & Structure, Accessibility, Functionality, Interactivity, SEO, +1 extra criterion you choose, +Final Conclusion row (only fill "Conclusion").  
- Website1–Website3: each = short intro phrase + one descriptive sentence of 10–20 words.Do not mention the Website in each cell.  
- Website4: same, but refers to the website from the provided image.  
- "Conclusion": only Website4 improvements, implicit comparison, highlight strengths + suggestions, never mention website names.  

Output must be strictly consistent, 6 keys per row, no extra text.

""")