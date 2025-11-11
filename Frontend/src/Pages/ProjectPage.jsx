
import { useState, useEffect } from "react";
import NavBarWSearch from "../components/NavBarWSearch";
import SideBar from "../components/SideBar";
import ErrorPage from "./ErrorPage";
import { useParams } from "react-router";
import PageContent from "../components/Project Page/PageContent"
import { getProjects } from "../../api/project";
import LoadingScreen from '../components/LoadingScreen.jsx'
import { useTasks } from "../context/ProjectContext";
import { useNavigate } from "react-router";

export default function ProjectPage() {
    const params = useParams()
    const navigate = useNavigate()
    const { setCurrentId, contextProject}= useTasks()
const [sbStatus, setSbStatus] = useState(false)
const [projects, setProjects] = useState([])
const [loading,setLoading]= useState(true)
useEffect(()=> {
    async function fetchData() {
    try{
        const data = await getProjects(localStorage.getItem('token'))
        setProjects(data)
        
    }
    catch(e) {console.log(e)
        navigate('/')
    }
    finally {setLoading(false)}
}
fetchData()
},[])

useEffect(()=> {
    
    setCurrentId(params.id)
    
}, [params.id])

const style = {left : sbStatus?  '-100%' : '0px'}

if(loading) return(<LoadingScreen/>)

return(
 <>
<NavBarWSearch menuFunc={() => setSbStatus(!sbStatus)}/>
<SideBar  projects={projects}style={style}/>
 <PageContent projName={contextProject.nombre}projectId={params.id} SbOpen={sbStatus}/>
</>
)
}