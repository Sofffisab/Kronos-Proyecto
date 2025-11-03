
import InputModal from "../../modals/InputModal";
import { useEffect } from "react";
import { useState } from "react";
import style from './list.module.css'
import { postTask } from "../../../../api/tasks";
import Category from "./Category";
import Bar from "./Bar.jsx";
import Table from "./table";
import Task from "./Task";
import { useTasks } from "../../../context/ProjectContext";
export default function List(props) {
  const {contextTasks, contextProject, fetchProject} = useTasks()
  const [modal, toggleModal] = useState(false);
  const tasks = contextTasks
console.log(contextTasks)
  const miembros = contextProject?.personas_tiene?.map((persona)=>(
    {nombre: persona.persona.nombre, id: persona.id_persona}))

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
const uploadTask = async (obj) => {
  try {
   await postTask(obj.name, obj.date, obj.person, localStorage.getItem('token'), props.projectId)}
  
  catch(e) {console.log(e)}
  finally {await fetchProject(props.projectId)}

}
  const submitModal = () => {
    console.log("bege");
    const name = document.getElementById("name").value;
    const date = document.getElementById("date").value;
    const person = document.getElementById("person").value;
    const pri = document.getElementById("pri").value;
    const state = document.getElementById("state").value;

    const obj = {
      name: name,
      person:parseInt( person),
      state: state,
      priority: pri,
      date: date,
      id: Math.random(),
    };

    if(!name || !date || !person || !pri || !state) return;
    uploadTask(obj)
    toggleModal(false);
  };
const mapTasks = (taskState)=>{
  
  return tasks.map((task) => (
    <Task
      name={task.nombre}
      icon={task.id_persona}
      priority={task.priority}
      date={new Date (task.limite).toDateString()}
      state={task.estado}
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
