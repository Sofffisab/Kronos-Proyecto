
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
import IaPage from '../components/IaPage/IaPage.jsx'

export default function ProjectPage(props) {
    const params = useParams()
    const navigate = useNavigate()
    const { setCurrentId, contextProject, error, iaPages, getIaChats}= useTasks()
const [sbStatus, setSbStatus] = useState(false)
const [projects, setProjects] = useState([])
const [loading,setLoading]= useState(true)
const [chats, setChats] = useState(iaPages)
useEffect(()=> {
    async function fetchData() {
    try{
        const chats = getIaChats();
        setChats(chats)
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
if(error) navigate('/*')

return(
 <>
<NavBarWSearch menuFunc={() => setSbStatus(!sbStatus)}/>
<SideBar  chats={chats}projects={projects}style={style}/>
 {props.ia? <IaPage SbOpen={sbStatus}/> : <PageContent projName={contextProject.nombre}projectId={params.id} SbOpen={sbStatus}/>}
</>
)
}