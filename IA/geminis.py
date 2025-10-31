# pip install -r lib.txt --no-warn-script-location
import os
import re
import json
from google import genai
from google.genai import types
from PIL import Image
from io import BytesIO
from pydantic import BaseModel
from typing import List
import requests
from bs4 import BeautifulSoup
import pandas as pd
import datetime
from tabulate import tabulate
import json
import time
import random
from openai import OpenAI

#client = genai.Client(api_key="AIzaSyAkiW5YQ7ONHn8i4qadg0KTzXRPRfy3r3E")
#nueva api xq nos quedamos sin tokens
#client = genai.Client(api_key="AIzaSyCXUdPHjrG_z0lIM0lyEIKlgnYvihzRvYE")
client = genai.Client(api_key="")

#la de OpenAI
clientChat = OpenAI(api_key="")

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


#Extrae el texto limpio de una URL
def extract_text_from_url(url: str) -> str:
    try:
        r = requests.get(url, timeout=10)
        r.raise_for_status()
        soup = BeautifulSoup(r.text, "html.parser")
        # Sacar scripts, estilos y texto basura
        for tag in soup(["script", "style"]):
            tag.decompose()
        text = " ".join(soup.stripped_strings)
        return text[:8000]  # límite para evitar respuestas largas
    except Exception as e:
        return f"Error leyendo {url}: {e}"


#Usa Gemini para buscar URLs relevantes al tema
def web_search_with_gemini(client, topic: str) -> list:

    response = retry_request(
        client.models.generate_content,
        model="gemini-2.5-flash",
        contents=(
           f"Buscá las 5 páginas web más útiles y famosas sobre {topic}, devolveme solo las URLs."
        ),
        config = types.GenerateContentConfig(
            tools=[grounding_tool]
        )
    )


    text = response.text
    urls = [u.strip() for u in text.split() if u.startswith("http")]
    return urls[:5]

#Busca y recopila textos de las páginas más relevantes
def gather_sources_for_topic(client, topic: str) -> list:
    urls = web_search_with_gemini(client, topic)
    sources = []
    for u in urls:
        text = extract_text_from_url(u)
        sources.append({"url": u, "text": text})
    return sources


#Crea una tabla comparativa (JSON) con los datos recolectados
def ask_openai_to_create_table(topic: str, sources: list) -> dict:
    client = OpenAI()
    prompt = f"""
    Analizá la información de estas páginas sobre {topic} y generá una tabla comparativa en formato JSON.
    Cada entrada debe incluir: nombre del sitio, principales características, ventajas, desventajas y valoración general.
    Fuentes:
    {json.dumps(sources[:3], ensure_ascii=False)[:6000]}
    """

    response = client.chat.completions.create(
        model="gpt-5",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.4,
    )

    content = response.choices[0].message.content
    try:
        return json.loads(content)
    except:
        return {"error": "No se pudo convertir a JSON", "raw": content}

#Flujo completo: búsqueda web → tabla JSON → imagen generada → código actualizado
def run_pipeline(topic: str, user_image_path: str, user_site_html_or_text: str):
    print(f"🔍 Buscando información sobre: {topic}")
    gemini_sources = gather_sources_for_topic(client, topic)
    print(f"✅ Se recopilaron {len(gemini_sources)} fuentes.")

    print("📊 Generando tabla comparativa con OpenAI...")
    table_data = ask_openai_to_create_table(topic, gemini_sources)
    print("✅ Tabla creada correctamente.")

    print("🎨 Creando imagen mejorada del sitio...")
    image_path = createImgSearching(user_image_path, topic)

    print("💻 Reescribiendo el código HTML/CSS...")
    new_code = createTxt(user_site_html_or_text, image_path, topic)

    print("✅ Pipeline completado con éxito.")
    return {
        "table": table_data,
        "image": image_path,
        "code": new_code
    }

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

#crear img buscando en internet
def createImgSearching(prompt, img_path=None):
    #para conseguir los tamaños de la img del input y respetarlos
    if img_path and os.path.exists(img_path):
        with Image.open(img_path) as img:
            inserted_img = img.tobytes()  # si querés pasar los bytes
            width, height = img.size


    contents = [
    types.Part.from_text(text=f"""
        Crea una imagen realista del sitio web mostrado en la imagen adjunta, incorporando las mejoras indicadas en la conclusión:
        - Ajustar colores y tipografía para mejor legibilidad.
        - Reorganizar botones importantes para navegación más intuitiva.
        - Añadir iconos y elementos visuales que mejoren la experiencia.
        - Mantener el estilo general del sitio original.
        - Mantener el mismo tamaño y proporción que la imagen original: ancho={width}px, alto={height}px.
        Tema: {prompt}
    """)
 ]

 # Si hay imagen se agrega
    if img_path and os.path.exists(img_path):
        with open(img_path, "rb") as f:
            img_bytes = f.read()
        contents.append(types.Part.from_bytes(data=img_bytes, mime_type="image/jpeg"))


    response = clientChat.responses.create(
        model="gpt-5",
        tools=[{"type": "web_search"}],
        input=contents
    )

    print("Response de img hecho")

    prompt_img = response.output_text

    # Generar img final
    response_img = retry_request(
        client.models.generate_content,
        model="gemini-2.0-flash-preview-image-generation",
        contents=[{"role": "user", "parts": [{"text": prompt_img}]}],
        config=types.GenerateContentConfig(
            response_modalities=["TEXT", "IMAGE"],
            temperature=0.3,
            top_p=0.9,
            top_k=40 
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


#CREAR CODIGO ARREGLADO
def createTxt(img_generated_path, conclusions_json, codigo_json, language_map):
    """
    img_generated_path: ruta a la imagen generada
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
        lang = language_map.get(name, "text")  # usar lenguaje definido por usuario, si no "text"
        codigo_blocks.append(f"🔧 Archivo: {name}\n```{lang}\n{content}\n```")

    codigo_str = "\n\n".join(codigo_blocks)

    prompt = f"""
 Vas a recibir: (A) código del sitio SIN cambios aplicados, (B) img de la página CON los cambios aplicados, (C) JSON DE conclusiones de las mejoras y cambios realizados para la img.
 Mejora el código para que la UI coincida exactamente con la imagen y las sugerencias planteadas.
 Devuelve SOLO BLOQUES DE CÓDIGO Markdown con encabezado '🔧 Archivo: <nombre>' y triple backticks con lenguaje indicado.

--- REFERENCIAS ---
Código actual:
{codigo_str}

Conclusiones / sugerencias:
{json.dumps(conclusions_json, indent=2, ensure_ascii=False)}
"""

    # Preparar contents para el modelo
    contents = [types.Part.from_text(text=prompt)]
    if img_generated_path and os.path.exists(img_generated_path):
        with open(img_generated_path, "rb") as f:
            img_bytes = f.read()
        contents.append(types.Part.from_bytes(data=img_bytes, mime_type="image/jpeg"))

    # Llamada al modelo
    response = clientChat.responses.create(
        model="gpt-5",
        tools=[{"type": "web_search"}],
        input=contents
    )
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
#def createJson(prompt, img_path="image.jpg"):
    response = retry_request(
        client.models.generate_content,
        model="gemini-2.5-flash",
        contents=(
            "Crea un prompt en base a tu función de busqueda en internet para poder conseguir información acerca del siguiente prompt y darselo a otra IA generadora de tablas " + prompt
        ),
        config = types.GenerateContentConfig(
            tools=[grounding_tool]
        )
    )
    print("Response de tabla hecho")

    prompt_board = response.text

    if os.path.exists(img_path):
        with open(img_path, "rb") as f:
            inserted_img = f.read()
    else:
        print(f"Imagen no encontrada: {img_path}")
        return

 #hacer tablita
    response = retry_request(
        client.models.generate_content,
        model="gemini-2.5-flash",
        contents=[
            prompt_board,
            types.Part.from_bytes(
                data=inserted_img,
                mime_type='image/jpeg'
            )
        ],
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
        createImgSearching(prompt=conclusion, img_path=img_path)
        imagen = image

    conclusion_text = " ".join(df["conclusion"].dropna().tolist())
    resultado_txt = createTxt(
        img_generated_path=image,
        conclusions_json=rows,
        codigo_json=codigo_json,
        language_map=language_map
    )
    print("Markdown generado:\n", resultado_txt["markdown"])





theme = 'PC MARKET'

if __name__ == "__main__":
    result = run_pipeline(
        topic="PC MARKET",
        user_image_path="image.jpg",
        user_site_html_or_text="<html><body><h1>Mi sitio</h1></body></html>"
    )


#createJson(f"""
#The JSON returned must be an array of 11 rows (objects).  
#Each row has in this order:  
#"criterion", "(NamePage1)", "(NamePage2)", "(NamePage3)", "(NamePage4)", "Conclusion".
#Websites 1 to 3 have to be the most famous about {theme}, and the 4th is the one of the img insterted.
#Rules:  
#- Criteria order: Typography & Readability, Colors & Branding, Visual Elements, Navigation & UX, Organization & Structure, Accessibility, Functionality, Interactivity, SEO, +1 extra criterion you choose, +Final Conclusion row (only fill "Conclusion").  
#- Website1–Website3: each = short intro phrase + one descriptive sentence of 10–20 words.Do not mention the Website in each cell.  
#- Website4: same, but refers to the website from the provided image.  
#- "Conclusion": only Website4 improvements, implicit comparison, highlight strengths + suggestions, never mention website names.  
#Output must be strictly consistent, 6 keys per row, no extra text.
#""")