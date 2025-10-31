
import InputModal from "../../modals/InputModal";
import { useEffect } from "react";
import { useState } from "react";
import style from './list.module.css'
import Category from "./Category";
import Bar from "./Bar.jsx";
import Table from "./table";
import Task from "./Task";
export default function List(props) {
  const [modal, toggleModal] = useState(false);
  const [tasks, setTasks] = useState(props.tasks? props.tasks : []);

  const miembros = props.project.personas_tiene.map((persona)=>(
    {nombre: persona.persona.nombre, id: persona.id}))

  useEffect(() => {
    if (modal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [modal]);

  const submitModal = () => {
    console.log("bege");
    const name = document.getElementById("name").value;
    const date = document.getElementById("date").value;
    const person = document.getElementById("person").value;
    const pri = document.getElementById("pri").value;
    const state = document.getElementById("state").value;

    const obj = {
      name: name,
      icon: person,
      state: state,
      priority: pri,
      date: date,
      id: Math.random(),
    };

    if(!name || !date || !person || !pri || !state) return;
    setTasks((prev) => [...prev, obj]);
    toggleModal(false);
  };
const mapTasks = (taskState)=>{
  
  return tasks.filter((task)=>task.state==taskState).map((task) => (
    <Task
      name={task.name}
      icon={task.icon}
      priority={task.priority}
      date={task.date}
      state={task.state}
      key={task.id}
    />
  ))}
  return (
    <>
      {modal && (
        <InputModal members={miembros}submit={submitModal} bgOnClick={() => toggleModal(false)} />
      )}
      {props.selectable && <Bar onClick={() => toggleModal(true)} />}
      <Category />
      <Table
        onClick={props.selectable && (() => toggleModal(true))}
        name="Tareas iniciadas"
        tasks={mapTasks('iniciada')}
      />
      <Table
        onClick={props.selectable && (() => toggleModal(true))}
        name="Tareas pendientes"
        tasks={mapTasks('pendiente')}
      />
      <Table
        onClick={props.selectable && (() => toggleModal(true))}
        name="Tareas finalizadas"
        tasks={mapTasks('realizada')}
      />
    </>
  );
}
