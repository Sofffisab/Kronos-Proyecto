
import { useState, useEffect } from "react";
import NavBarWSearch from "../components/NavBarWSearch";
import SideBar from "../components/SideBar";
import ErrorPage from "./ErrorPage";
import { useParams } from "react-router";
import PageContent from "../components/Project Page/PageContent"
import {getProjects, getTasks} from '../../api/project.js'
import LoadingScreen from '../components/LoadingScreen.jsx'


export default function ProjectPage() {
    const params = useParams()
const [sbStatus, setSbStatus] = useState(false)
const [projects, setProjects] = useState([])
const [loading,setLoading]= useState(true)
const [selectedProject, setSelectedProject] = useState(null)
useEffect(()=> {
    async function fetchData() {
    try{
        const data = await getProjects(localStorage.getItem('token'))
        setProjects(data)
        
        if(params.id) {
        const project = await getProjects(localStorage.getItem('token'), params.id)
        setSelectedProject(project)
        
    }
    }
    catch(e) {console.log(e)}
    finally {setLoading(false)}
}
fetchData()
},[])

const style = {left : sbStatus?  '-100%' : '0px'}

if(loading) return(<LoadingScreen/>)

return(
 <>
<NavBarWSearch menuFunc={() => setSbStatus(!sbStatus)}/>
<SideBar  projects={projects}style={style}/>
{!params.id?<div className='emptyProjPage'><p>Load a project to begin...</p></div> : <PageContent  project={selectedProject}SbOpen={sbStatus}/>}
</>
)
}