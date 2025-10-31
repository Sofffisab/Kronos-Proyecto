
import { useState, useEffect } from "react";
import NavBarWSearch from "../components/NavBarWSearch";
import SideBar from "../components/SideBar";
import ErrorPage from "./ErrorPage";
import { useParams } from "react-router";
import PageContent from "../components/Project Page/PageContent"
import {getProjects} from '../../api/project.js'


export default function ProjectPage() {
    const params = useParams()
const [sbStatus, setSbStatus] = useState(false)
const [projects, setProjects] = useState([])
useEffect(()=> {
    async function fetchData() {
    try{
        const data = await getProjects(localStorage.getItem('token'))
        setProjects(data)
        console.log(data)
    }
    catch(e) {console.log(e)}
}
fetchData()
},[])

const style = {left : sbStatus?  '-100%' : '0px'}



return(
 <>
<NavBarWSearch menuFunc={() => setSbStatus(!sbStatus)}/>
<SideBar  projects={projects}style={style}/>
{!params.id?<div className='emptyProjPage'><p>Load a project to begin...</p></div> : <PageContent  SbOpen={sbStatus}/>}
</>
)
}