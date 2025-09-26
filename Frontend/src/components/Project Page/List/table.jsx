import { useState } from "react"
import Separator from "../../Separator";

export default function Table(props) {
const [toggleTasks, setToggleTasks] = useState(true);
const content = toggleTasks?   props.tasks : <Separator/>

    return(
        <div className='table'>
            <div><span onClick={() =>setToggleTasks(!toggleTasks)}className='material-symbols-outlined'>keyboard_arrow_{toggleTasks? 'down' : 'up'}</span>{props.name}</div>
        <div >{content}</div>
        </div>
    )
}