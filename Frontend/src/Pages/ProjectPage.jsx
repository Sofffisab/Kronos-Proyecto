
import { useState } from "react";
import NavBarWSearch from "../components/NavBarWSearch";
import SideBar from "../components/SideBar";
import ErrorPage from "./ErrorPage";
import { useParams } from "react-router";
import PageContent from "../components/Project Page/PageContent"
import FancyTitle from "../components/FancyTitle";


export default function ProjectPage() {
    const params = useParams()
const [sbStatus, setSbStatus] = useState(false)

const style = {left : sbStatus?  '-100%' : '0px'}



return(
 <>
<NavBarWSearch menuFunc={() => setSbStatus(!sbStatus)}/>
<SideBar style={style}/>
{!params.id?<div className='emptyProjPage'><p>Load a project to begin...</p></div> : <PageContent  SbOpen={sbStatus}/>}
</>
)
}