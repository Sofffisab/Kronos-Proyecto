import Categorias from "./categorias";
import Tarea from "./Tarea";
import { useState } from "react";
import KanbanModal from "../../modals/KanBanModal";
import { useTasks } from "../../../context/ProjectContext";
import TaskModal from '../../modals/TaskModal'
import { postTask } from "../../../../api/tasks";
import LoadingScreen from "../../LoadingScreen"
export default function kanban(props) {

     const {contextTasks, user, fetchProject} = useTasks()
     const [loading, setLoading] = useState(false)
     const [modal, toggleModal] = useState(false)
    const [modal2, setModal2] = useState(false)
      const tasks = contextTasks.filter((task)=>(task.isKanban  === true))
    const [type, setType] = useState('')
    const [selectedTask, setSelectedTask] = useState(null)
    const mappedTasks = tasks?{
        
        rTasks: tasks.filter((task) => task.estado=='pending').map((task)=> <Tarea setModal={(task)=>{setSelectedTask({id: task.id,nombre: task.nombre}); setModal2(true)}} key={task.id} id={task.id} type={task.estado} text={task.nombre}/>),
        aTasks: tasks.filter((task) => task.estado=='delayed').map((task)=> <Tarea setModal={(task)=>{setSelectedTask({id: task.id,nombre: task.nombre}); setModal2(true)}} key={task.id} id={task.id} type={task.estado} text={task.nombre}/>),
        pTasks: tasks.filter((task) => task.estado=='in-progress').map((task)=> <Tarea setModal={(task)=>{setSelectedTask({id: task.id,nombre: task.nombre}); setModal2(true)}} key={task.id} id={task.id} type={task.estado} text={task.nombre}/>),
        tTasks: tasks.filter((task) => task.estado=='done').map((task)=> <Tarea setModal={(task)=>{setSelectedTask({id: task.id,nombre: task.nombre}); setModal2(true)}} key={task.id} id={task.id} type={task.estado} text={task.nombre}/>)
    } : {}
    
    const openModal = (type) => {
        toggleModal(true);
        setType(type)
    }
    const submit = async ()=> {
        const task ={
        name: document.getElementById('name').value,
        date: '2024-12-31',
        state: document.getElementById('type').value,
        priority:'high',
        isKanban: true
        }
        setLoading(true)
        try {
           await postTask(task.name, task.date, task.person, localStorage.getItem('token'), props.projectId, task.state, task.priority, task.isKanban)}
          
          catch(e) {console.log(e)}
          finally {await fetchProject(props.projectId)
            toggleModal(false)
          }
       
        
    }
    loading && <LoadingScreen/>
    return(
        <>
        {modal2 && <TaskModal project='task'kanBan={true} id={selectedTask.id} title={selectedTask.nombre} disableBg={()=>setModal2(false)}/>}
        {modal && <KanbanModal value={type}submit={submit} bgOnClick={()=> toggleModal(false)}/>}
        <Categorias 
        rTasks={mappedTasks.rTasks}
        OnClick={props.selectable && openModal}
        aTasks={mappedTasks.aTasks}
    pTasks={mappedTasks.pTasks}
    tTasks={mappedTasks.tTasks}/>
    </>
    )
}