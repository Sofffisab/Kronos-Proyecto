import Categorias from "./categorias";
import tasksFile from "../List/tasks";
import Tarea from "./Tarea";
import { useState } from "react";
import DisabledBg from "../../modals/DisabledBg";
import KanbanModal from "../../modals/KanBanModal";
export default function kanban() {

    const [tasks, setTasks] = useState(tasksFile)

    const mappedTasks ={
        rTasks: tasks.filter((task) => task.type=='riesgo').map((task)=> <Tarea key={task.id}type={task.type} text={task.text}/>),
        aTasks: tasks.filter((task) => task.type=='atrasada').map((task)=> <Tarea key={task.id} type={task.type} text={task.text}/>),
        pTasks: tasks.filter((task) => task.type=='proceso').map((task)=> <Tarea key={task.id} type={task.type} text={task.text}/>),
        tTasks: tasks.filter((task) => task.type=='terminado').map((task)=> <Tarea key={task.id} type={task.type} text={task.text}/>)
    }
    const [modal, toggleModal] = useState(false)

    const submit = ()=> {
        const task ={
        text: document.getElementById('name').value,
        type: document.getElementById('type').value,
        id: tasks.length
        }
        setTasks(prev => [...prev, task])
        toggleModal(false)
    }

    return(
        <>
        {modal && <KanbanModal submit={submit}submitbgOnClick={()=> toggleModal(false)}/>}
        <Categorias 
        rTasks={mappedTasks.rTasks}
        OnClick={()=>toggleModal(true)}
        aTasks={mappedTasks.aTasks}
    pTasks={mappedTasks.pTasks}
    tTasks={mappedTasks.tTasks}/>
    </>
    )
}