import DisabledBg from './DisabledBg'
import BaseModal from'./BaseModal'
import SimpleButton from '../SimpleButton'
import { deleteTask } from '../../../api/tasks'
import { deleteProject } from '../../../api/project'
import style from './modals.module.css'
import { useNavigate } from 'react-router'
import { useTasks } from '../../context/ProjectContext'
export default function TaskModal(props) {
    const nav = useNavigate()
    const {fetchProject, currentId} = useTasks()
    const handleDelete = async (id)=> {
        try {
    
           const res =  props.project?  await deleteProject(id, localStorage.getItem('token')) : await deleteTask(id, localStorage.getItem('token'))
           if(res && !props.project) fetchProject(currentId)
            if(res && props.project) nav('/')
            props.disableBg
        }
    catch(e) {console.log(e)}

    }

    return(

        <DisabledBg onClick={props.disableBg} modal={<BaseModal title={props.title} inputs={
            <>
            <div>
            <p>Limite: {props.date}</p>
            <p>{props.project? 'Miembros' : 'Responsable'}: {props.responsable}</p>
            </div>
            <SimpleButton class={style.deleteTaskBtn}text='delete' icon='delete' onClick={()=>handleDelete(props.id)}/>
                </>
        }/>}/>

    )
}