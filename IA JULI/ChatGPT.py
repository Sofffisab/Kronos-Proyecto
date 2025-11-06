#cd "C:\Users\49318078\Documents\GitHub\Kronos-Proyecto\IA JULI"
#pip install openai python-dotenv flask pandas psycopg2


from openai import OpenAI
import os
from dotenv import load_dotenv
from flask import Flask, request, jsonify
import json
import re
from typing import List
import pandas as pd
import time
import psycopg2


# importamos todo lo necesario para laburarr


load_dotenv()  # para traer las variables del env
app = Flask(__name__)
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))  # usamos la apikey que esta bien guardadita en el env


@app.route("/organizar", methods=["POST"])
def organizar_tareas():
    data = request.json  # definimos la ruta x donde se va a ejecutar mi funcion hermosa


    prompt = f"""
    Soy una ia que organiza las tareas ingresadas por el usuario en una pestaña del front para maximizar la eficiencia del cumplimiento de las mismas.
    Para ello, ordeno estas tareas según fechas límite, importancia y el horario laboral que ingresa el usuario, además de tener en cuenta cómo se maneja el mismo para hacerle una mejor organización de sus tareas.
    Luego el nuevo orden se le agenda en el calendario al usuario, esto quiere decir que si tiene una tarea para dentro de 20 días, lo partimos en varias fechas para que pueda completarla.
    Devuelvo la lista en formato JSON con el orden ideal. Sin explicaciones, sin texto adicional, solo JSON.
   
    Formato de salida esperado:
    [
      {{ "nombre": "...", "fecha_limite": "...", "duracion": ..., "dia_recomendado": "YYYY-MM-DD" }},
      ...
    ]


    Tareas: {data["tareas"]}
    """  # prompt a la IAAA checkkk


    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "Eres un asistente que responde solo en formato JSON válido."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=200
        )
#WOOO ESTA QUEDA IGUAAALLLLL

        plan_text = response.choices[0].message.content.strip()


        # si la ia devuelve el json encerrado entre ```json ... ``` lo limpiamos
        if plan_text.startswith("```"):
            plan_text = plan_text.split("```json")[-1].split("```")[-1].strip()


        # intentamos convertirlo a json posta posta
        try:
            plan_json = json.loads(plan_text)
            return jsonify({"plan": plan_json})  # si salió todo bien, devolvemos el json listo
        except json.JSONDecodeError:
            return jsonify({"plan_text": plan_text})  # si no es json válido, devolvemos el texto sin romper nada


    except Exception as e:
        print(e)
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(debug=True)
