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
    <ProjectItem project='project' key={item.id} id={item.id} nombre={item.nombre} date={item.fechaInicio} miembros={item.personas_tiene}/>
)) : 'Nothing to see here...'

const chats = props.chats? props.chats.map((item)=> (
    <ProjectItem ia={true} key={item.pagina_id} id={item.pagina_id} nombre={item.tema}/>
)) : 'Nothing to see here...'

return(
    <>
    {modal && <JoinProjectModal submit={handleSubmit}value={code} onChange={setCode} disableBg={()=>setModal(false)}/>}
<div className='sideBar' style={props.style} >
<ul className='tabs'>
    <div onClick={()=>setModal(true)}id='addBtn'><span className='material-symbols-outlined'>add_circle</span>Unirse</div>
   <Link to='/project'><div id='inicioBtn'><span className='material-symbols-outlined'>home</span>Inicio</div></Link>
    
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
<FancyTitle class='proyectosTitle' text='Chats IA'/>
<SimpleButton link='/project/ia'icon='add'class='teamBtn'/>
</div>
<ul className='equipos'>
{chats}
</ul>
<Separator/>
    
</div>
</>
)


}