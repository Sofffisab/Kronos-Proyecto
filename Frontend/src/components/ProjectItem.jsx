import { stringToColor } from '../../api/project.js'
import {Link} from 'react-router'
import { useState } from 'react'

import TaskModal from './modals/TaskModal.jsx'
export default function ProjectItem(props) {
  
    const [modal, setModal] = useState(false)

    const personas = props.miembros.map((p)=>(
        p.persona.nombre
    ))

    return(
        <>
        {modal && <TaskModal id={props.id} project={true} disableBg={()=>setModal(false)} date={new Date (props.date).toDateString()} responsable={personas}/> }
        <Link className='project' key={props.id}to={'/project/'+props.id}> 
        
        <div>
            <div className='projectColorBox' style={{backgroundColor: stringToColor(props.nombre)}}/>
                <p className='projectBoxName'>{props.nombre}</p>
                <span onClick={()=>setModal(true)}className='material-symbols-outlined'>more_vert</span>
            </div>
        </Link>
        </>
    )
}