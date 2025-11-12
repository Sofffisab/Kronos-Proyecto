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
    else if(props.state === 'done') setToggled(true)
},[props.state])

    const toggleTask = async () => {
        let state
        if(!toggled) state='done'
        else state='pending' 
        await markTask(props.id,state, localStorage.getItem('token'))
        await fetchProject(currentId)
    }


        
    return(
        <>
        {modal && <TaskModal date={props.date} responsable={props.icon}id={props.id}title={props.name} disableBg={()=>setModal(false)}/>}
        <div className={style['category']}>
        <div ><span onClick={ toggleTask} className='material-symbols-outlined'>check_box{!toggled && '_outline_blank'}</span><p className={toggled? style['title-checked'] : style['title']}>{props.name}</p></div>
        <div>{props.icon}</div>
        <div>{props.date}</div>
        <div>
        <p className={`${style.colored} ${props.priority=='high'? style.high : props.priority=='mid'? style.mid : props.priority=='low'? style.low : null}`}>{props.priority}</p>
        </div>
        <div>
        <p className={`${style.colored} ${props.state=='pending'? style.pending : props.state=='done'? style.resolved : props.state=='in-progress'? style.progress : null}`}>{props.state}</p>
        </div>
        <div className={style['end']}><span className="material-symbols-outlined " onClick={()=>setModal(true)}>more_vert</span></div>
        </div>
        </>
)
}