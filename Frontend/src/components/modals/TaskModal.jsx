import DisabledBg from './DisabledBg'
import BaseModal from'./BaseModal'
import SimpleButton from '../SimpleButton'
import { deleteTask } from '../../../api/tasks'
import { deleteProject } from '../../../api/project'
import style from './modals.module.css'
import { useNavigate } from 'react-router'
import { useTasks } from '../../context/ProjectContext'
import { useState } from 'react'
import { deleteIaPage } from '../../../api/ia'
export default function TaskModal(props) {
    const nav = useNavigate()
    const {fetchProject, currentId} = useTasks()
    const [modal, setModal] = useState(false)
    const [message, setMessage] = useState('')
    const handleDelete = async (id)=> {
        try {
    
           const res =  props.project?  await deleteProject(id, localStorage.getItem('token')) : props.kanBan ? await deleteTask(id, localStorage.getItem('token')) : 
           await deleteIaPage(props.id, localStorage.getItem('token'))
           if(res && !props.project) fetchProject(currentId)
            if(res ) nav('/')
            props.disableBg()
        }
    catch(e) {console.log(e)
        setMessage(e.message)
        setModal(true)
    }

    }

    const responsables = props.project && props.responsable.map((p)=>(<li key={Math.random()}>{p}</li>))

    return(

        <DisabledBg onClick={props.disableBg} modal={modal? <BaseModal title={message}/> : <BaseModal title={props.title} inputs={
            <>
            {!props.kanBan || !props.ia && <div>   
            <p>Limite: {props.date}</p>
            <p>{props.project? 'Miembros:' : `Responsable: ${props.responsable}`}</p>
            {props.project &&  <ul>{responsables}</ul>}
            </div>}
            <SimpleButton class={style.deleteTaskBtn}text='delete' icon='delete' onClick={()=>handleDelete(props.id)}/>
                </>
        }/>}/>

    )
}