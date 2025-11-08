import { useEffect, useState } from "react"
import style from './list.module.css'
import { markTask } from "../../../../api/tasks"
import { useTasks } from "../../../context/ProjectContext"
import TaskModal from "../../modals/TaskModal"
export default function Task(props) {
const {fetchProject, currentId} = useTasks()
const [toggled, setToggled] = useState(null)
const [modal, setModal] = useState(false)
useEffect(()=>{if(props.state === 'pending') setToggled(false)
    else if(props.state === 'resolved') setToggled(true)
},[props.state])

    const toggleTask = async () => {
        let state
        if(!toggled) state='resolved'
        else state='pending' 
        await markTask(props.id,state, localStorage.getItem('token'))
        await fetchProject(currentId)
    }


        
    return(
        <>
        {modal && <TaskModal id={props.id}title={props.name} disableBg={()=>setModal(false)}/>}
        <div className={style['category']}>
        <div ><span onClick={ toggleTask} className='material-symbols-outlined'>check_box{!toggled && '_outline_blank'}</span><p className={toggled? style['title-checked'] : style['title']}>{props.name}</p></div>
        <div>{props.icon}</div>
        <div>{props.date}</div>
        <div>{props.priority}</div>
        <div>{props.state}</div>
        <div className={style['end']}><span className="material-symbols-outlined " onClick={()=>setModal(true)}>more_vert</span></div>
        </div>
        </>
)
}