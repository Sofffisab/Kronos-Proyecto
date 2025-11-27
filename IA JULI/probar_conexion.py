import requests
import json
from datetime import datetime, timedelta


BASE_URL = "http://127.0.0.1:5000"  
USUARIO = "Juli"  # usuario logueado simulado

# Horario laboral de prueba para Juli
horario_laboral_mock = {
    "lunes": 240,
    "martes": 180,
    "miércoles": 180,
    "jueves": 120,
    "viernes": 120,
    "sábado": 60,
    "domingo": 0
}

# Tareas de prueba
tareas_prueba = [
    {
        "nombre": "Investigar IA",
        "responsable": USUARIO,
        "fecha_limite": "2025-12-05",
        "prioridad": "alta",
        "estado": "pendiente",
        "descripcion": "Investigar sobre redes neuronales",
        "horario_laboral": horario_laboral_mock
    },
    {
        "nombre": "Escribir informe",
        "responsable": "OtroUsuario",
        "fecha_limite": "2025-12-06",
        "prioridad": "media",
        "estado": "pendiente",
        "descripcion": "Redactar informe mensual",
        "horario_laboral": {}
    }
]

print("🔹 Probando /organizar...")

try:
    response = requests.post(
        f"{BASE_URL}/organizar",
        headers={"Content-Type": "application/json", "Usuario": USUARIO},
        data=json.dumps(tareas_prueba)
    )
    data = response.json()
except Exception as e:
    print("❌ No se pudo conectar o parsear la respuesta:", e)
    data = {}

# Si no hay plan, generamos uno de prueba
if "plan" in data and data["plan"]:
    plan = data["plan"]
    print("✅ Plan generado por la IA para el usuario logueado:")
else:
    print("⚠️ No se generó plan real, usando plan de prueba...")
    plan = [
        {
            "nombre": "Investigar IA",
            "responsable": USUARIO,
            "fecha_limite": "2025-12-05",
            "prioridad": "alta",
            "estado": "pendiente",
            "planificacion": [
                {"dia": "2025-12-01", "tiempo_asignado": "2 horas"},
                {"dia": "2025-12-02", "tiempo_asignado": "2 horas"}
            ]
        }
    ]

print(json.dumps(plan, indent=4, ensure_ascii=False))

print("\n🔹 Simulando envío al calendario...")
eventos_calendarizados = []

for tarea in plan:
    for dia in tarea.get("planificacion", []):
        evento = {
            "nombre": tarea["nombre"],
            "dia": dia["dia"],
            "tiempo_asignado": dia["tiempo_asignado"]
        }
        eventos_calendarizados.append(evento)

print("✅ Eventos que se enviarían al Google Calendar:")
print(json.dumps(eventos_calendarizados, indent=4, ensure_ascii=False))
