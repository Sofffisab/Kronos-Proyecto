import os
from core.json_creator import createJson
from dotenv import load_dotenv

# Cargar variables de entorno (.env)
load_dotenv()

def main():
    theme = "PC MARKET"
    img_path = os.path.join("data", "recursos", "site_example.png")

    print("🚀 Iniciando generación de tabla y rediseño de sitio...\n")

    createJson(f"""
    The JSON returned must be an array of 11 rows (objects).  
    Each row has in this order:  
    "criterion", "(NamePage1)", "(NamePage2)", "(NamePage3)", "(NamePage4)", "Conclusion".
    Websites 1 to 3 have to be the most famous about {theme}, and the 4th is the one of the img insterted.
    Rules:  
    - Criteria order (rows): Typography & Readability, Colors & Branding, Visual Elements, Navigation & UX, Organization & Structure, Accessibility, Functionality, Interactivity, SEO, +1 extra criterion you choose, +Final Conclusion row (only fill "Conclusion").  
    - Website1–Website3 (columns): each = short intro phrase + one descriptive sentence of 10–20 words. Do not mention the Website in each cell.  
    - Website4 (column): same, but refers to the website from the provided image.  
    - "Conclusion" (column): only Website4 improvements, implicit comparison, highlight strengths + suggestions, never mention website names.  
    Try not to use the same words for the cells, so each creteria doesn't have the exact words. Use an extensive vocabulary.
    Output must be strictly consistent, 6 keys per row, no extra text.

    The response must be in spanish.
    """, img_path=img_path)

    print("\n✅ Proceso completo. Archivos generados en carpeta 'tablas_generadas'.")

if __name__ == "__main__":
    main()