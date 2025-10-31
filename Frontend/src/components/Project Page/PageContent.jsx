
import { useState } from "react";
import style from './PgContent.module.css';
import List from "./List/List.jsx";
import SelectBar from "./SelectBar";
import Calendar from "./Calendar/calendar";
import Kanban from "./KanBan/Kanban";
import Messages from "./Messages/Messages";
export default function ProjectPageContent(props) {

const [selected, setSelected] = useState(1) 


return (<div className={style['PgContent']} style={props.SbOpen?{marginLeft: '0px', width: '100%'} : {}}>
<SelectBar setSelected={setSelected} selected={selected} SbOpen={props.SbOpen}/>
{selected==1? <Calendar selectable={true}/> : selected==2?<List selectable={true}/> : selected==3? <Kanban selectable={true}/> : selected==4? <Messages/> : null}
<img className={style['IaBtn']}src='../../../public/IaBtn.svg'/>
</div>
)

}