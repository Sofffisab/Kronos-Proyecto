import { stringToColor } from '../../api/project.js'
import {Link} from 'react-router'
import { useState } from 'react'

import TaskModal from './modals/TaskModal.jsx'
export default function ProjectItem(props) {
  
    const [modal, setModal] = useState(false)

    const personas = props.miembros ? props.miembros.map((p)=>(
        p.persona.nombre
    )) : []

    return(
        <>
        {modal && <TaskModal ia={props.ia?true:false}id={props.id} title={props.nombre}project={props.project} disableBg={()=>setModal(false)} date={new Date (props.date).toDateString()} responsable={personas}/> }
        <div className='project' key={props.id}> 
            <div>
        <Link to={props.project? '/project/'+props.id : '/project/ia/'+props.id}>
        
            <div className='projectColorBox' style={{backgroundColor: stringToColor(props.nombre)}}/>
                <p className='projectBoxName'>{props.nombre}</p>
        </Link>
                <span onClick={(e)=>{e.stopPropagation(); setModal(true)}} className='material-symbols-outlined'>more_vert</span>
            </div>
        </div>
        </>
    )
}