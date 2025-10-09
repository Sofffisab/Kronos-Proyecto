import Categorias from "./categorias";
import Tarea from "./Tarea";
import { useState } from "react";
import KanbanModal from "../../modals/KanBanModal";
export default function kanban() {

    const [tasks, setTasks] = useState([])
    const [type, setType] = useState('')
    const mappedTasks = tasks?{
        
        rTasks: tasks.filter((task) => task.type=='riesgo').map((task)=> <Tarea key={task.id}type={task.type} text={task.text}/>),
        aTasks: tasks.filter((task) => task.type=='atrasada').map((task)=> <Tarea key={task.id} type={task.type} text={task.text}/>),
        pTasks: tasks.filter((task) => task.type=='proceso').map((task)=> <Tarea key={task.id} type={task.type} text={task.text}/>),
        tTasks: tasks.filter((task) => task.type=='terminado').map((task)=> <Tarea key={task.id} type={task.type} text={task.text}/>)
    } : {}
    const [modal, toggleModal] = useState(false)
    const openModal = (type) => {
        toggleModal(true);
        setType(type)
    }
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
        {modal && <KanbanModal value={type}submit={submit} bgOnClick={()=> toggleModal(false)}/>}
        <Categorias 
        rTasks={mappedTasks.rTasks}
        OnClick={ openModal}
        aTasks={mappedTasks.aTasks}
    pTasks={mappedTasks.pTasks}
    tTasks={mappedTasks.tTasks}/>
    </>
    )
}