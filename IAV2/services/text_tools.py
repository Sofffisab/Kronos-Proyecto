import json
import re
from io import BytesIO
from PIL import Image
from services.openai_client import clientChat
from config.settings import GPT_MODEL




def createTxt(img_from_ai, conclusions_json, codigo_json, language_map):
    """Solicita a GPT-5 que genere los archivos de código actualizados para que coincidan con la imagen.
    Devuelve markdown completo y lista de archivos parseados.
    """
    # Preparar codigo
    codigo_blocks = []
    for c in codigo_json:
        name = c.get("name", "archivo")
        content = c.get("content", "")
        lang = language_map.get(name, "text")
        codigo_blocks.append(f"🔧 Archivo: {name}\n```{lang}\n{content}\n```")
        codigo_str = "\n\n".join(codigo_blocks)


    # Preparar imagen en base64 para adjuntar (si es ruta)
    img_b64 = ""
    if isinstance(img_from_ai, str) and img_from_ai:
        try:
            if img_from_ai.startswith("data:image"):
                img_b64 = img_from_ai
            else:
                with open(img_from_ai, "rb") as f:
                    img_b64 = "data:image/png;base64," + (f.read()).encode("base64")
        except Exception:
            img_b64 = ""


    prompt = f"""
    Vas a recibir: (A) código original, (B) imagen con los cambios aplicados, (C) JSON con conclusiones.
    Mejora el código para que la UI coincida exactamente con la imagen y las sugerencias planteadas.
    Devuelve SOLO BLOQUES DE CÓDIGO Markdown con encabezado '🔧 Archivo: <nombre>' y triple backticks con lenguaje indicado.
    \nCódigo actual:\n{codigo_str}\n\nConclusiones / sugerencias:\n{json.dumps(conclusions_json, indent=2, ensure_ascii=False)}
    """


    # Llamada (simplificada) a clientChat.responses.create
    response = clientChat.responses.create(
    model=GPT_MODEL,
    input=[{"role": "user", "content": [{"type": "input_text", "text": prompt}] }]
    )


    output_text = response.output_text


    # Parse bloques
    pattern = r"(?:🔧\s*)?Archivo:\s*(.*?)\n```([\w+\-]+)\n(.*?)```"
    matches = re.findall(pattern, output_text, re.DOTALL)
    parsed = []
    for filename, lang, code in matches:
        parsed.append({"name": filename.strip(), "lang": lang.strip(), "content": code.rstrip()})


    return {"markdown": output_text, "files": parsed}