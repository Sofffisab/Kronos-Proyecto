import { useState } from "react"

export default function Task(props) {

const [toggled, setToggled] = useState(false)

    return(

        <div className='category'>
        <div ><span onClick={() => setToggled(!toggled)} className='material-symbols-outlined'>check_box{!toggled && '_outline_blank'}</span><p className={toggled? 'title-checked' : 'title'}>{props.name}</p></div>
        <div>{props.icon}</div>
        <div>{props.date}</div>
        <div>{props.priority}</div>
        <div>{props.state}</div>
        <div id='end'></div>
        </div>
)
}