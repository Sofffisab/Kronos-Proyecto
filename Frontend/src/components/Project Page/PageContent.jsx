
import { useState } from "react";
import style from './PgContent.module.css';
import List from "./List/List.jsx";
import SelectBar from "./SelectBar";
import Calendar from "./Calendar/calendar";
import Kanban from "./KanBan/Kanban";
import Messages from "./Messages/Messages";
import { Link } from "react-router";
export default function ProjectPageContent(props) {

const [selected, setSelected] = useState(1) 
const id = props.projectId


return (<div className={style['PgContent']} style={props.SbOpen?{marginLeft: '0px', width: '100%'} : {}}>
    {!id?<div className='emptyProjPage'><p>Load a project to begin...</p></div> :<>
<SelectBar projName={props.projName}setSelected={setSelected} selected={selected} SbOpen={props.SbOpen}/>
{selected==1? <Calendar projectId={id} selectable={true}/> : selected==2?<List  projectId={id} selectable={true}/> : selected==3? <Kanban  projectId={id} selectable={true}/> : selected==4? <Messages projectId={id} /> : null}
<Link to='../project/ia'><img className={style['IaBtn']}src='../../../public/IaBtn.svg'/></Link>
</>}
</div>
)

}