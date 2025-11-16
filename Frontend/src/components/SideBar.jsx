import SimpleButton from '../components/SimpleButton.jsx'
import Separator from './Separator.jsx'
import {Link} from 'react-router'
import FancyTitle from './FancyTitle.jsx'
import ProjectItem from './ProjectItem.jsx'
import Task from './Project Page/List/Task.jsx'
import { useState } from 'react'
import JoinProjectModal from './modals/JoinProjectModal.jsx'
import { joinProject } from '../../api/project.js'
import { useTasks } from '../context/ProjectContext.jsx'

export default function SideBar(props) {
const {getProjects} = useTasks
const [modal, setModal] = useState(false)
const [code, setCode] = useState(null)

const handleSubmit = async () => {

    try {
       const res = await joinProject(code, localStorage.getItem('token'))
        console.log(res)
    }
    catch(e) {
        console.log(e)
    }
    finally {
        setCode('')
        setModal(false)
        getProjects
    }

}


const projects = props.projects? props.projects.map((item)=> (
    <ProjectItem id={item.id} nombre={item.nombre} date={item.fechaInicio} miembros={item.personas_tiene}/>
)) : 'Nothing to see here...'

const teams = props.teams? props.teams.map((item)=> (
    <Link to={item.link}><div className='project'><div style={{backgroundColor: item.color}}/><p>{item.title}</p></div></Link>
)) : 'Nothing to see here...'

return(
    <>
    {modal && <JoinProjectModal submit={handleSubmit}value={code} onChange={setCode} disableBg={()=>setModal(false)}/>}
<div className='sideBar' style={props.style} >
<ul className='tabs'>
    <div onClick={()=>setModal(true)}id='addBtn'><span className='material-symbols-outlined'>add_circle</span>Unirse</div>
    <div id='inicioBtn'><span className='material-symbols-outlined'>home</span>Inicio</div>
    <div id='tareasBtn'><span className='material-symbols-outlined'>list_alt_add</span>Mis tareas</div>
</ul>

<Separator/>
<div className='titleSbContainer'>
<FancyTitle class='proyectosTitle' text='Proyectos'/>
<SimpleButton icon='add' link='/create' class='teamBtn'/>
</div>
<div className='proyectos'>
    {projects}
</div>

<div className='titleSbContainer'>
<FancyTitle class='proyectosTitle' text='Equipos'/>
<SimpleButton icon='add'class='teamBtn'/>
</div>
<ul className='equipos'>
{teams}
</ul>
<Separator/>
<SimpleButton class='invitarBtn' icon='mail' text='Invitar'/>
</div>
</>
)


}