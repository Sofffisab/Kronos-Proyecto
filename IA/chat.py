# openai_port_from_gemini_userversion.py
"""
Script adaptado para tu caso: usuario ingresa imagen de su página web + código (diseño HTML/CSS) + tópico.
Flujo completo: búsqueda web real → tabla comparativa → imagen rediseñada → código ajustado.
Requisitos: pip install openai requests pandas pillow openpyxl
"""

import os
import re
import json
import time
import random
import base64
from io import BytesIO
from typing import List, Dict, Optional

import requests
import pandas as pd
from PIL import Image

from openai import OpenAI

# ------------------------
# CONFIG — setear variables de entorno antes de ejecutar
# ------------------------
OPENAI_API_KEY = ""
SERPAPI_KEY = "3456cbc3b003625f11478455998b62a6ddd18bd056d03964e253456945e198ff"

TEXT_MODEL = os.getenv("TEXT_MODEL", "gpt-5")
IMAGE_MODEL = os.getenv("IMAGE_MODEL", "gpt-image-1")

SAVE_DIR = "tablas_generadas"
os.makedirs(SAVE_DIR, exist_ok=True)

if not OPENAI_API_KEY:
    raise RuntimeError("Setear OPENAI_API_KEY en variables de entorno antes de ejecutar.")

client = OpenAI(api_key=OPENAI_API_KEY)

# ------------------------
# Utilidades
# ------------------------
def retry_request(func, *args, max_retries: int = 5, base_delay: float = 1.0, **kwargs):
    for attempt in range(max_retries):
        try:
            return func(*args, **kwargs)
        except Exception as e:
            msg = str(e).lower()
            retryable = any(x in msg for x in ("503", "502", "timeout", "timed out", "rate limit", "temporarily"))
            if attempt < max_retries - 1 and retryable:
                wait = base_delay * (2 ** attempt) + random.random()
                print(f"[retry] Transient error: {e}. Reintentando en {wait:.1f}s...")
                time.sleep(wait)
                continue
            else:
                print("[retry] Error final o no reintentable.")
                raise

def web_search_serpapi(query: str, num: int = 5) -> List[Dict]:
    if not SERPAPI_KEY:
        raise RuntimeError("SERPAPI_KEY no configurada.")
    params = {"q": query, "api_key": SERPAPI_KEY, "num": num, "engine": "google"}
    resp = requests.get("https://serpapi.com/search.json", params=params, timeout=12)
    resp.raise_for_status()
    j = resp.json()
    results = []
    for r in j.get("organic_results", [])[:num]:
        results.append({
            "title": r.get("title"),
            "link": r.get("link"),
            "snippet": r.get("snippet") or r.get("rich_snippet", {}).get("top", "")
        })
    return results

def web_search(query: str, num: int = 5) -> List[Dict]:
    try:
        if SERPAPI_KEY:
            return web_search_serpapi(query, num=num)
        else:
            raise RuntimeError("Configurar SERPAPI_KEY.")
    except Exception as e:
        print(f"[web_search] Error: {e}")
        raise

def save_image_from_b64(b64data: str, out_path: str) -> None:
    image_data = base64.b64decode(b64data)
    with open(out_path, "wb") as f:
        f.write(image_data)

def open_image(path: str):
    try:
        img = Image.open(path)
        img.show()
        return img
    except Exception as e:
        print(f"[open_image] {e}")
        return None

def create_image(prompt: str, out_path: str = "openai-image.png", size: str = "1024x1024") -> str:
    def call():
        return client.images.generate(model=IMAGE_MODEL, prompt=prompt, size=size, n=1)
    resp = retry_request(call)
    b64 = None
    if isinstance(resp, dict):
        data = resp.get("data") or resp.get("images") or []
        if data:
            b64 = data[0].get("b64_json") or data[0].get("b64")
    else:
        try:
            b64 = resp.data[0].b64_json
        except Exception:
            pass
    if not b64:
        raise RuntimeError("No se obtuvo imagen en base64 del endpoint.")
    save_image_from_b64(b64, out_path)
    print(f"[create_image] Guardada en {out_path}")
    open_image(out_path)
    return out_path

def create_image_from_prompt_and_reference(prompt: str, reference_img_path: Optional[str] = None,
                                          out_path: str = "final_design.png", size: str = "1024x1024") -> str:
    final_prompt = prompt
    if reference_img_path and os.path.exists(reference_img_path):
        with open(reference_img_path, "rb") as f:
            ref_b64 = base64.b64encode(f.read()).decode("utf-8")
        final_prompt = (
            "Toma en cuenta la siguiente imagen de referencia (base64) para respetar proporciones y estilo. "
            f"Prompt de diseño: {prompt}\n\n---IMAGEN_BASE64_START---\n{ref_b64}\n---IMAGEN_BASE64_END---"
        )
    return create_image(final_prompt, out_path=out_path, size=size)

def generate_table_with_web_search(topic: str, websites_count: int = 3) -> Dict:
    query = f"top websites about {topic}"
    print(f"[generate_table] Buscando: {query}")
    
    # Obtener resultados
    results = web_search(query, num=websites_count)
    top_sites = results[:websites_count]
    
    # Construir texto resumido de cada sitio (truncado)
    sites_text = []
    for i, s in enumerate(top_sites, 1):
        snippet = s.get("snippet") or ""
        snippet = snippet.replace("\n", " ").strip()[:150] + ("..." if len(snippet) > 150 else "")
        title = (s.get("title") or "")[:60]
        sites_text.append({
            "title": title,
            "link": s.get("link"),
            "snippet": snippet
        })
    
    # Prompt mínimo para JSON
    system = "Eres un asistente que compara diseños web y genera un JSON estricto. Devuelve SOLO JSON."
    user_prompt = (
        f"Topic: {topic}\n"
        f"Top websites resumidos: {json.dumps(sites_text, ensure_ascii=False)}\n"
        "Produce un JSON array de 11 objetos con las claves exactas: "
        "\"criterion\", \"Website1\", \"Website2\", \"Website3\", \"Website4\", \"Conclusion\".\n"
        "Website1-3: breve descripción de cada sitio.\n"
        "Website4: referencia a la futura imagen final (no se incluye imagen aquí).\n"
        "Conclusion: sugerencias de mejora solo para Website4.\n"
        "Devuelve SOLO JSON, sin texto adicional ni explicaciones."
    )
    
    def call_chat():
        return client.chat.completions.create(
            model=TEXT_MODEL,
            messages=[{"role": "system", "content": system},
                      {"role": "user", "content": user_prompt}],
            max_completion_tokens=4000
        )
    
    print("[generate_table] Solicitando a modelo la tabla JSON...")
    resp = retry_request(call_chat)
    
    try:
        content = resp.choices[0].message["content"]
    except Exception:
        content = getattr(resp.choices[0].message, "content", None) or str(resp)
    
    # Limpiar saltos de línea en strings para parsear JSON
    content_clean = re.sub(r'\n', ' ', content)
    
    try:
        rows = json.loads(content_clean)
        if not isinstance(rows, list):
            raise ValueError("No es una lista JSON.")
    except Exception:
        m = re.search(r"(\[.*\])", content_clean, re.DOTALL)
        if m:
            try:
                rows = json.loads(m.group(1))
            except Exception as e:
                raise RuntimeError("No pude parsear JSON devuelto por el modelo.") from e
        else:
            raise RuntimeError("Respuesta del modelo no contiene JSON válido.")
    
    df = pd.DataFrame(rows)
    if "Conclusion" in df.columns:
        cols = [c for c in df.columns if c != "Conclusion"] + ["Conclusion"]
        df = df[cols]
    
    json_path = os.path.join(SAVE_DIR, "tablita.json")
    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(rows, f, ensure_ascii=False, indent=2)
    xlsx_path = os.path.join(SAVE_DIR, "tablita.xlsx")
    df.to_excel(xlsx_path, index=False)
    
    conclusion_text = " ".join([r.get("Conclusion", "") for r in rows if r.get("Conclusion")])
    if not conclusion_text.strip():
        conclusion_text = "Mejorar navegación y accesibilidad visual; ajustar tipografía y contraste."
    
    return {"rows": rows, "dataframe": df, "json_path": json_path, "xlsx_path": xlsx_path, "conclusion_text": conclusion_text}

def create_txt(img_generated_path: str, conclusions_json: List[Dict], codigo_json: List[Dict], language_map: Dict[str, str]) -> Dict:
    codigo_blocks = []
    for c in codigo_json:
        name = c.get("name", "archivo")
        content = c.get("content", "")
        lang = language_map.get(name, "text")
        codigo_blocks.append(f"🔧 Archivo: {name}\n```{lang}\n{content}\n```")
    codigo_str = "\n\n".join(codigo_blocks)

    prompt = (
        "Vas a recibir: (A) código del sitio SIN cambios aplicados, (B) una imagen final con los cambios aplicados "
        "y (C) un JSON con conclusiones/sugerencias. Mejora el código para que la UI coincida exactamente con la imagen y las sugerencias.\n\n"
        "Devuelve SOLO BLOQUES DE CÓDIGO Markdown con encabezado '🔧 Archivo: <nombre>' y triple backticks con lenguaje indicado.\n\n"
        f"---REFERENCIAS---\nCódigo actual:\n{codigo_str}\n\nConclusiones:\n{json.dumps(conclusions_json, indent=2, ensure_ascii=False)}\n\n"
        f"La imagen final está en el path: {img_generated_path} (respeta proporciones y estilos)."
    )

    def call_chat():
        return client.chat.completions.create(
            model=TEXT_MODEL,
            messages=[
                {"role": "system", "content": "Eres un asistente que transforma código front-end para que coincida con un diseño dado."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=4000
        )
    resp = retry_request(call_chat)
    try:
        output_text = resp.choices[0].message["content"]
    except Exception:
        output_text = str(resp)

    pattern = r"🔧 Archivo:\s*(.*?)\n```([\w\+\-]+)\n(.*?)```"
    matches = re.findall(pattern, output_text, re.DOTALL)
    parsed = [{"name": filename.strip(), "lang": lang.strip(), "content": code.rstrip()} for filename, lang, code in matches]
    return {"markdown": output_text, "files": parsed}

def process_user_website(topic: str, uploaded_image_path: Optional[str], codigo_json: List[Dict], language_map: Dict[str, str]) -> Dict:
    # Generar tabla JSON solo con los 3 sitios principales
    table_result = generate_table_with_web_search(topic=topic, websites_count=3)
    conclusions_rows = table_result["rows"]
    conclusion_text = table_result["conclusion_text"]
    print("[process] Tabla creada. Conclusión:", conclusion_text[:200])

    # Generar imagen final usando la conclusión y la imagen subida (base64 se maneja internamente)
    generated_img_path = os.path.join(SAVE_DIR, "final_design.png")
    create_image_from_prompt_and_reference(
        prompt=conclusion_text,
        reference_img_path=uploaded_image_path if uploaded_image_path and os.path.exists(uploaded_image_path) else None,
        out_path=generated_img_path,
        size="1024x1024"
    )

    # Generar código ajustado según la imagen y las conclusiones
    resultado = create_txt(
        img_generated_path=generated_img_path,
        conclusions_json=conclusions_rows,
        codigo_json=codigo_json,
        language_map=language_map
    )

    # Guardar resultados
    out_bundle = {
        "table_json": table_result["json_path"],
        "table_xlsx": table_result["xlsx_path"],
        "final_image": generated_img_path,
        "fixed_code_markdown": os.path.join(SAVE_DIR, "codigo_arreglado.md"),
        "fixed_files": resultado["files"]
    }

    with open(out_bundle["fixed_code_markdown"], "w", encoding="utf-8") as f:
        f.write(resultado["markdown"])
    for fdesc in resultado["files"]:
        outpath = os.path.join(SAVE_DIR, fdesc["name"])
        with open(outpath, "w", encoding="utf-8") as fh:
            fh.write(fdesc["content"])
        print(f"[process] Guardado archivo ajustado: {outpath}")

    print("[process] Flujo completado.")
    return out_bundle


if __name__ == "__main__":
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

    language_map = {"index.html": "html", "style.css": "css"}

    topic = "PC MARKET"
    uploaded_image = "image.jpg"

    try:
        result = process_user_website(topic=topic,
                                      uploaded_image_path=uploaded_image if os.path.exists(uploaded_image) else None,
                                      codigo_json=codigo_json,
                                      language_map=language_map)
        print("Resultado completo:", json.dumps(result, indent=2))
    except Exception as err:
        print("Error durante el flujo:", err)
