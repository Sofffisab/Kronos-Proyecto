
import { useState } from "react";
import './PgContent.css';
import tasks from './List/tasks'
import List from "./List/List.jsx";
import SelectBar from "./SelectBar";
import Calendar from "./Calendar/calendar";
import Kanban from "./KanBan/Kanban";
export default function ProjectPageContent(props) {

const [selected, setSelected] = useState(1) 


return (<div className='PgContent' style={props.SbOpen?{marginLeft: '0px', width: '100%'} : {}}>
<SelectBar setSelected={setSelected} selected={selected} SbOpen={props.SbOpen}/>
{selected==1? <Calendar/> : selected==2?<List tasks={tasks}/> : selected==3? <Kanban/> : selected==4? 'mensajes' : null}
</div>
)

}