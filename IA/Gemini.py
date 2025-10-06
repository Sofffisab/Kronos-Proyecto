# pip install -r lib.txt --no-warn-script-location
import os
import json
from google import genai
from google.genai import types
from PIL import Image
from io import BytesIO
from pydantic import BaseModel
from typing import List
import base64
import pandas as pd
import datetime
from tabulate import tabulate
import json
import time
import random

#client = genai.Client(api_key="AIzaSyAkiW5YQ7ONHn8i4qadg0KTzXRPRfy3r3E")
#nueva api xq nos quedamos sin tokens
client = genai.Client(api_key="AIzaSyCXUdPHjrG_z0lIM0lyEIKlgnYvihzRvYE")

#modelo de la tabla
class WebsiteValue(BaseModel):
    name: str
    description: str

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

codigo = [
    {
        "html": """
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

                        <main id="mainSesion" class="sesion non">
                            <div class="titulo">
                                <h1>Bienvenido a</h1> 
                                <p><img class="pcity" src="../../recursos/img/logo2.png"></p>
                            </div>
                            <button class="cruz" id="cruzSesion"><img src="../../recursos/img/cruzBoton.png"></button>
                            <div class="texto" id="login">
                                <input id="nombreS" type="text" placeholder="Nombre">
                                <input id="contraS" type="password" placeholder="Contraseña">

                                <button id="ojoCloseS" class="ojoClose" ><span class="material-symbols-outlined">visibility_off</span></button>
                                <button id="ojoS" class="ojo non"><span class="material-symbols-outlined">visibility</span></button>

                                <p class="non error" id="errorS">Usuario o contraseña incorrecta</p> 
                            </div>
                        
                        
                            <button id="iniciar" class="iniciar">Iniciar sesión</button>
                                
                            <div class="crearCuenta">
                                <p class="cuenta">¿No tienes una cuenta?</p> 
                                <button id="crear" class="crear">Crea una cuenta</button>
                            </div>
                        </main>

                        <main id="mainRegistrar" class="login non">
                            <div class="titulo">
                                <h1>Bienvenido a</h1> 
                                <p><img class="pcity" src="../../recursos/img/logo2.png"></p>
                            </div>
                            <button class="cruz" id="cruzRegistrar"><img  src="../../recursos/img/cruzBoton.png"></button>
                            <div class="texto" id="login">
                                <input id="nombreR" type="text" placeholder="Nombre">
                                <input id="contraR" type="password" placeholder="Contraseña">

                                <button id="ojoCloseR" class="ojoClose" ><span class="material-symbols-outlined">visibility_off</span></button>
                                <button id="ojoR" class="ojo non"><span class="material-symbols-outlined">visibility</span></button>

                                <p class="non error" id="errorR">Error al crear cuenta</p> 
                            </div>
                        
                            <button class="registrar" id="registrar">Registrarse</button>
                                
                            <div class="crearCuenta">
                                <p class="cuenta">¿Ya tienes una cuenta?</p> 
                                <button id="iniciarSesion" class="crear">Inicia sesión</button>
                            </div>
                        </main>

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
        "css": """
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

                        &:hover{
                            cursor:pointer;
                            scale: 1.03;
                        }
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
                        
                        &.busc::placeholder{
                            color: #D9D9D9;
                            background-image: url(../../recursos/img/lupa.buscador.png);
                            background-size: 20px;
                            background-repeat: no-repeat;
                            background-position: left 2px center;
                            padding-left: 27px;
                        }

                        &.busc:focus{
                            outline: none;
                        }
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
                    .busqs div:last-child {
                        border-bottom: none;
                        border-radius: 0 0 10px 10px;
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

                        .pcity{
                            height: 110px;
                            width: 140px;
                            margin-left: 2%;
                            margin-bottom: -1.5%;
                        }

                        h1{
                            font-family: 'inter';
                            font-weight: bolder;
                            font-size: 5rem;
                            margin-top: -1%;
                            margin-left: 16%;
                            width: 60%;
                            display: flex;
                            
                        }
                        
                        h2{
                            font-family: 'inter';
                            margin-top: -5%;
                            font-size: 2.5rem;
                            font-style: bold;
                        }
                    }

                    p{
                        font-family: 'inter';
                        margin-left: 3%;
                        font-size: 2.7rem;
                        margin-top: 2%;
                    }

                    .comp{
                        height: 160px;
                        width: 290px;
                        background-color: #e2e2e2;
                        border: 5px none;
                        border-radius: 10px;
                        padding: 10px;
                        display: flex;
                        justify-content: flex-start;
                        flex-direction: row-reverse;
                        align-items:center;
                        box-sizing: border-box;
                        font-size: 1.5rem;
                        font-family: 'inter';
                        font-style: normal;
                        transition: 0,3s ease;

                        &:hover{
                            scale: 1.01;
                            cursor:pointer;
                            background-color: #e2e2e2;
                        }
                    }



                    .foto{
                        margin-right: 25%;
                        margin-right: 10%;
                        height: 80px;
                        width: 110px;
                    }

                    .componentesPopu{
                        display: flex;
                        flex-wrap: wrap;
                        justify-content: space-evenly;
                        gap:10px;
                    }

                    .login {
                        position: fixed;
                        left: 50%;
                        top: 50%;
                        transform: translate(-50%, -50%);
                        background-color: #f2f2f2;
                        border-radius: 30px;
                        height: 50%;
                        width: 25%;
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        font-family: 'Crimson Text', serif;
                        z-index: 100;
                        border: 1px solid rgb(199, 199, 199);

                        .titulo {
                        display: flex;
                        justify-content: center;
                        align-items: flex-start;
                        margin-top: 5%;
                        width: 100%;

                            h1 {
                                font-family: 'Inter', sans-serif;
                                font-weight: bolder;
                                font-size: 2rem;
                                width: 100%;
                                margin-left: 7%;
                                margin-top: 5%;
                            }

                            .pcity {
                                height: 50px;
                                width: 55px;
                                margin-left: -100%;
                            }
                        }

                        .texto {
                        display: flex;
                        flex-direction: column;
                        margin-top: -15%;
                        gap: 10px;
                        }

                        input {
                            background-color: white;
                            border-radius: 4px;
                            width: 17em;
                            height: 2.4em;
                            border: none;
                            font-size: 18px;
                            border: solid 1px rgb(189, 189, 189);

                            &:focus{
                                outline: none;
                            }
                        }
                        
                        .registrar {
                            font-size: 1.6em;
                            background-color: rgb(55, 75, 103);
                            color: white;
                            border-radius: 6px;
                            border: none;
                            margin-top: 10%;
                            width: 12rem;
                            height: 3rem;
                            cursor: pointer;
                        }
                        
                        .error {
                            color: rgb(214, 68, 68);
                            font-size: 1rem;
                            font-weight: 600;
                            position: absolute;
                            bottom: 27%;
                            left: 23%;
                        }
                        
                        .crearCuenta {
                            display: flex;
                            flex-wrap: nowrap;
                            flex-direction: row;
                            justify-content: center;
                            width: 80%;

                            .cuenta{
                                font-size: medium;
                            }
                            
                            .crear {
                                border: none;
                                color: #78a1ea;
                                background-color: transparent;
                                text-decoration: underline;
                                cursor: pointer;
                                margin-top: -4%;
                            }
                        }
                        
                    }

                    .sesion {
                        z-index: 100;
                        position: fixed;
                        left: 50%;
                        top: 50%;
                        transform: translate(-50%, -50%);
                        background-color: #f2f2f2;
                        border-radius: 30px;
                        height: 50%;
                        width: 25%;
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        font-family: 'Crimson Text', serif;
                        border: 1px solid rgb(199, 199, 199);

                        .titulo {
                        display: flex;
                        justify-content: center;
                        align-items: flex-start;
                        margin-top: 5%;
                        width: 100%;

                            h1 {
                                font-family: 'Inter', sans-serif;
                                font-weight: bolder;
                                font-size: 2rem;
                                width: 100%;
                                margin-left: 7%;
                                margin-top: 5%;
                            }

                            .pcity {
                                height: 50px;
                                width: 55px;
                                margin-left: -100%;
                            }
                        }

                        .texto {
                        display: flex;
                        flex-direction: column;
                        margin-top: -15%;
                        gap: 10px;
                        }

                        input {
                            background-color: white;
                            border-radius: 4px;
                            width: 17em;
                            height: 2.4em;
                            border: none;
                            font-size: 18px;
                            border: solid 1px rgb(189, 189, 189);

                            &:focus{
                                outline: none;
                            }
                        }
                        
                        .iniciar {
                            font-size: 1.6em;
                            background-color: rgb(55, 104, 172);
                            color: white;
                            border-radius: 6px;
                            border: none;
                            margin-top: 10%;
                            width: 13rem;
                            height: 3rem;
                            cursor: pointer;
                        }
                        
                        .error {
                            color: rgb(214, 68, 68);
                            font-size: 1rem;
                            font-weight: 600;
                            position: absolute;
                            bottom: 27%;
                            left: 10%;
                        }
                        
                        .crearCuenta {
                            display: flex;
                            flex-direction: row;
                            justify-content: center;
                            align-items: center;
                            width: 100%;
                        }
                        
                        .cuenta {
                            font-size: medium;
                        }
                        
                        .crear {
                            border: none;
                            color: #78a1ea;
                            background-color: transparent;
                            text-decoration: underline;
                            cursor: pointer;
                            margin-top: -4%;
                        }
                    }


                    .non{
                        display: none;
                    }

                    .fondo{
                        filter: blur(5px);
                    }

                    .cruz{
                        height: 1px;
                        width: 1px;
                        margin-bottom: 2%;

                        &:hover{
                            cursor: pointer;
                        }
                    }

                    .cruz img{
                        height: 12px;
                        width: 12px;
                        position: relative;
                        bottom: 105px;
                        margin-left: 140px;
                    }

                    .ojoClose{
                        position: absolute;
                        bottom: 42%;
                        right: 7%;
                        border: none;
                        background-color: white;

                        &:hover{
                            cursor: pointer;
                        }
                    }

                    .ojo{
                        position: absolute;
                        bottom: 42%;
                        right: 7%;
                        border: none;
                        background-color: white;

                        &:hover{
                            cursor: pointer;
                        }
                    }

                    .componenteFondo{
                        pointer-events: none;
                        opacity: 0.4;
                    }
        """
    },
    {
        "js": """
                            document.addEventListener('DOMContentLoaded', () => {
                        let opciones = [];

                        const input1 = document.getElementById('input1');
                        const busq1 = document.getElementById('busq1');
                        const componentesPopu = document.querySelector(".componentesPopu");

                        fetchData('componentes', (componentes) => {
                            const componentesProcesados = Object.values(componentes).flat().map(item => ({
                                nombre: item.nombre,  
                                imagen: item.imagen
                            }));
                            
                            console.log(componentesProcesados);

                            // Eliminar duplicados en las opciones
                            opciones = [...new Set(componentesProcesados.map(item => item.nombre))];
                            setupAutocomplete(input1, busq1, opciones);
                            mostrarComponentes(componentesProcesados);
                        });

                        function mostrarComponentes(componentes) {
                            componentes.forEach(item => {
                                const tarjeta = document.createElement('button');
                                const foto = document.createElement('img');
                                const nombre = document.createElement('h5');
                        
                                tarjeta.classList.add('comp');
                                foto.classList.add('foto');
                                foto.src = item.imagen;
                                nombre.textContent = item.nombre;
                        
                                tarjeta.appendChild(nombre);
                                tarjeta.appendChild(foto);
                                componentesPopu.appendChild(tarjeta);

                                tarjeta.addEventListener("click", click);
                                function click() {
                                    window.location.href = "../comparacion/index.html";
                                }
                            });
                        }

                        function setupAutocomplete(input, busq, opciones) {
                            input.addEventListener('input', function () {
                                const inputValue = input.value.toLowerCase();
                                busq.innerHTML = '';

                                const opcionFilt = opciones.filter(opcion =>
                                    opcion.toLowerCase().startsWith(inputValue)
                                );

                                opcionFilt.forEach(opcion => {
                                    const suggestionItem = document.createElement('div');
                                    suggestionItem.textContent = opcion;
                                    busq.appendChild(suggestionItem);

                                    suggestionItem.addEventListener('click', function () {
                                        input.value = opcion;
                                        busq.innerHTML = ''; // Limpiar sugerencias.
                                        window.location.href = '../comparacion/index.html';
                                    });
                                });

                                if (inputValue === '' || opcionFilt.length === 0) {
                                    busq.innerHTML = '';
                                }
                            });
                        }

                        const mainSesion = document.getElementById("mainSesion");
                        const mainRegistrar = document.getElementById("mainRegistrar");

                        const iniciarBoton = document.getElementById('iniciar');
                        const errorS = document.getElementById('errorS');
                        const errorR = document.getElementById('errorR');
                        const botonVolverIniciar = document.getElementById('iniciarSesion');
                        const botonCrear = document.getElementById("crear");

                        const ojoS = document.getElementById("ojoS");
                        const ojoCloseS = document.getElementById("ojoCloseS");
                        const ojoR = document.getElementById("ojoR");
                        const ojoCloseR = document.getElementById("ojoCloseR");
                        const contraseñaInputS = document.getElementById("contraS");
                        const contraseñaInputR = document.getElementById("contraR");
                        const personaBoton = document.querySelector(".log");
                        const inicio = document.querySelector(".inicio");
                        const nombreInputS = document.getElementById("nombreS");
                        const nombreInputR = document.getElementById("nombreR");

                        function persona() {
                            mainSesion.classList.remove("non");
                            inicio.classList.add("fondo");
                        }
                        personaBoton.addEventListener('click', persona);

                        function salirSesion() {
                            mainSesion.classList.add("non");
                            inicio.classList.remove("fondo");
                        }
                        const cruzSesion = document.getElementById('cruzSesion');
                        cruzSesion.addEventListener('click', salirSesion);

                        function salirRegistrar() {
                            mainRegistrar.classList.add("non");
                            inicio.classList.remove("fondo");
                        }
                        const cruzRegistrar = document.getElementById('cruzRegistrar');
                        cruzRegistrar.addEventListener('click', salirRegistrar);

                        function iniciarSesion() {
                            const nombre = nombreInputS.value;
                            const contraseña = contraseñaInputS.value;

                            postData("sesion", {nombre, contraseña}, (response) => {
                                if (response.ok) {
                                    window.location.href = "../inicio/index.html";
                                    personaBoton.classList.add("non");
                                } else {
                                    errorS.classList.remove("non");
                                }
                            });
                        }
                        iniciarBoton.addEventListener("click", iniciarSesion);

                        function registrarse() {
                            const nombre = nombreInputR.value; 
                            const contraseña = contraseñaInputR.value;

                            postData("registrar", {nombre, contraseña}, (response) => {
                                if (response.ok) {
                                    window.location.href = "../inicio/index.html";
                                    personaBoton.classList.add("non");
                                } else {
                                    errorR.classList.remove("non");
                                }
                            });
                        }

                        function iniciar() {
                            mainRegistrar.classList.add("non");
                            mainSesion.classList.remove("non");
                        }
                        botonVolverIniciar.addEventListener('click', iniciar);

                        function crearCuenta() {
                            mainSesion.classList.add("non");
                            mainRegistrar.classList.remove("non");
                        }
                        botonCrear.addEventListener('click', crearCuenta);

                        function contraseñaS() {
                            const input = contraseñaInputS;

                            if (input.type === 'password') {
                                input.type = 'text';
                                ojoS.classList.remove("non");
                                ojoCloseS.classList.add("non");
                            } else {
                                input.type = 'password';
                                ojoS.classList.add("non");
                                ojoCloseS.classList.remove("non");
                            }
                        }
                        ojoS.addEventListener('click', contraseñaS);
                        ojoCloseS.addEventListener('click', contraseñaS);

                        function contraseñaR() {
                            const input = contraseñaInputR;

                            if (input.type === 'password') {
                                input.type = 'text';
                                ojoR.classList.remove("non");
                                ojoCloseR.classList.add("non");
                            } else {
                                input.type = 'password';
                                ojoR.classList.add("non");
                                ojoCloseR.classList.remove("non");
                            }
                        }

                        ojoR.addEventListener('click', contraseñaR);
                        ojoCloseR.addEventListener('click', contraseñaR);

                        document.getElementById('registrar').addEventListener('click', registrarse);
                    });
        """
    }
]

#crear tabla e img buscando en internet
def createJson(prompt, img_path="image.jpg"):
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

    with open(img_path, "rb") as f:
        inserted_img = f.read()

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
        websites_dict = {w["name"]: w["description"] for w in websites_raw}
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

    conclusion_text = " ".join(df["conclusion"].dropna().tolist())
    createTxt(img_inserted=img_path, img_created="gemini-image.png", conclusion=conclusion_text)



#crear texto
def createTxt(img_inserted, img_created, conclusion=""):
    # Cargar el código como texto
    codigo_str = "\n\n".join([c.get("html","") + c.get("css","") + c.get("js","") for c in codigo])
    
    prompt = f"""
    Analiza el siguiente código de un sitio web (HTML, CSS, JS):
    {codigo_str}

    También analiza la imagen de referencia (ruta: {img_inserted}), la mejorada (ruta: {img_created}) y las siguientes sugerencias de la tabla:
    {conclusion}

    Tu tarea es:
    1. Mejorar el código para que la UI se acerque a la imagen mejorada y siga las recomendaciones.
    2. Mantener la funcionalidad original.
    3. Ajustar colores, tipografía, distribución de botones, visibilidad y accesibilidad.
    4. Optimizar el CSS para mantener consistencia y claridad.
    5. No inventes nuevas secciones, solo mejora las existentes.

    Devuelve el código completo como JSON con 3 claves: 
    {{
        "html": "HTML completo",
        "css": "CSS completo",
        "js": "JS completo"
    }}
    """
    
    response = retry_request(
        client.models.generate_content,
        model="gemini-2.5-flash",
        contents=prompt,
        config=types.GenerateContentConfig(
            tools=[grounding_tool]
        )
    )
    
    # Mostrar resultado
    print(response.text)
    return response.text


#crear img buscando en internet (con texto + img opcional)
def createImgSearching(prompt, img_path=None):

    #para conseguir los tamaños de la img del input y respetarlos
    if img_path and os.path.exists(img_path):
        with Image.open(img_path) as img:
            inserted_img = img.tobytes()  # si querés pasar los bytes
            width, height = img.size


    contents = [
        {"role": "user", "parts": [{"text": (f"""
            Crea una imagen realista del sitio web mostrado en la imagen adjunta, incorporando las mejoras indicadas en la conclusión:
           - Ajustar colores y tipografía para mejor legibilidad.
           - Reorganizar botones importantes para navegación más intuitiva.
           - Añadir iconos y elementos visuales que mejoren la experiencia.
           - Mantener el estilo general del sitio original.
           No inventes nuevos elementos, solo mejora lo que ya existe. La imagen debe mostrar claramente los cambios sugeridos.Mantener el mismo tamaño y proporción que la imagen original: ancho={width}px, alto={height}px.
            Tema: {prompt}
            """
        )}]}
    ]

# si viene img, se añade al contents (input)
    if img_path and os.path.exists(img_path):
        with open(img_path, "rb") as f:
            inserted_img = f.read()
        contents[0]["parts"].append(
            types.Part.from_bytes(data=inserted_img, mime_type="image/jpeg")
        )

    response = retry_request(
        client.models.generate_content,
        model="gemini-2.5-flash",
        contents=contents,
        config=types.GenerateContentConfig(
            tools=[grounding_tool]
        )
    )
    print("Response de img hecho")

    prompt_img = response.text

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
                print(part.text)
            elif part.inline_data is not None:
                image = Image.open(BytesIO(part.inline_data.data))
                image.save("gemini-image.png", overwrite=True)
                image.show()
    else:
        print("No se generó ninguna imagen para este prompt.")


theme = 'PC MARKET'

createJson(f"""
The JSON returned must be an array of 11 rows (objects).  
Each row has these keys in this order:  
"criterion", "(NamePage1)", "(NamePage2)", "(NamePage3)", "(NamePage4)", "Conclusion".
Websites 1 to 3 have to be the most famous about {theme}, and the 4th is the one of the img insterted.
Rules:  
- Criteria order: Typography & Readability, Colors & Branding, Visual Elements, Navigation & UX, Organization & Structure, Accessibility, Functionality, Interactivity, SEO, +1 extra criterion you choose, +Final Conclusion row (only fill "Conclusion").  
- Website1–Website3: each = short intro phrase + one descriptive sentence of 20–30 words.Do not mention the Website in each cell.  
- Website4: same, but refers to the website from the provided image.  
- "Conclusion": only Website4 improvements, implicit comparison, highlight strengths + suggestions, never mention website names.  

Output must be strictly consistent, 6 keys per row, no extra text.

""")

#createTxt("como son los diseños de las páginas web de mercado libre, pedido ya y amazon? hazme una descripción teniendo en cuenta: Sitio Web, Tipografía, Colores, Formal o informal, Personajes-iconos-emblemas, Accesibilidad, Capacidad de navegación, Organización (botones importantes), Funciones extras, Tutoriales o instrucciones")

#createImgSearching("Crea una img de un chico de 16 años, de piel muuuy blanca y tomando mate. debe estar en uruguay, y tener una camiseta del país")

#createImg("")