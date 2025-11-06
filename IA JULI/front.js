const tareas = [
    { nombre: "Estudiar inglés", fecha_limite: "2025-11-09", duracion: 60 },
    { nombre: "Hacer informe", fecha_limite: "2025-11-07", duracion: 120 }
  ];
  
  
  fetch("http://localhost:5000/organizar", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(tareas)
  })
    .then(res => res.json())
    .then(data => console.log("Orden sugerido:", data.plan));
  
  
  