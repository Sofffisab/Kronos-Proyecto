import base64


def createImg(prompt: str, out_path: str = "gemini-image.png"):
    """Genera una imagen a partir de un prompt con Gemini y la guarda.
    Retorna la ruta del archivo si se genera correctamente, o None.
    """
    contents = [
    {"role": "user", "parts": [{"text": prompt}]}
    ]


    response = retry_request(
        client.models.generate_content,
        model=GEMINI_IMAGE_MODEL,
        contents=contents,
        config=types.GenerateContentConfig(response_modalities=["TEXT", "IMAGE"])
        )


    for part in response.candidates[0].content.parts:
        if getattr(part, "inline_data", None):
            img = Image.open(BytesIO(part.inline_data.data))
            img.save(out_path)
            print(f"Imagen guardada en {out_path}")
            return out_path
        elif getattr(part, "text", None):
            print(part.text)
            return None




def _image_to_b64(img_path: str) -> str:
    with open(img_path, "rb") as f:
        return base64.b64encode(f.read()).decode("utf-8")




def createImgSearching(conclusion_text: str, img_path: str):
    """Recibe texto (conclusión) y una imagen local: pide a Gemini que genere una versión mejorada visualmente.
    Retorna la ruta de la imagen editada.
    """

    # Preparar prompt
    prompt_img_inicial = f"Genera una versión mejorada visualmente de la siguiente interfaz. {conclusion_text}"

    # Leer bytes de la imagen
    with open(img_path, "rb") as f:
        img_bytes = f.read()

    # Generar imagen con Gemini
    response_img = retry_request(
        client.models.generate_content,
        model=GEMINI_IMAGE_MODEL,
        contents=[
            types.Part.from_text(text=prompt_img_inicial),
            types.Part.from_bytes(mime_type="image/png", data=img_bytes),
        ],
        config=types.GenerateContentConfig(response_modalities=["TEXT", "IMAGE"]),
    )

    out_path = "imagen_editada.png"
    for part in response_img.candidates[0].content.parts:
        if part.inline_data:
            with open(out_path, "wb") as out:
                out.write(part.inline_data.data)

    print("✅ Imagen mejorada guardada:", out_path)
    return out_path
