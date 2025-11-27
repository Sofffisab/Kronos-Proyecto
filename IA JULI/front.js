const tareas = [
];

fetch("http://localhost:5000/organizar", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(tareas)
})
  .then(res => res.json())
  .then(data => console.log("Orden sugerido:", data.plan));

