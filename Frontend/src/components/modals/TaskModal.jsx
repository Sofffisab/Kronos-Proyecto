import DisabledBg from './DisabledBg'
import BaseModal from'./BaseModal'
import SimpleButton from '../SimpleButton'
import { deleteTask } from '../../../api/tasks'
import { getTasks } from '../../../api/project'
import style from './modals.module.css'
import { useTasks } from '../../context/ProjectContext'
export default function TaskModal(props) {
    const {fetchProject, currentId} = useTasks()
    const handleDelete = (id)=> {
        try {
           const res = deleteTask(id, localStorage.getItem('token'))
           if(res) fetchProject(currentId)
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