import { useState } from "react"
import style from './list.module.css'
export default function Task(props) {

const [toggled, setToggled] = useState(false)

    return(

        <div className={style['category']}>
        <div ><span onClick={() => setToggled(!toggled)} className='material-symbols-outlined'>check_box{!toggled && '_outline_blank'}</span><p className={toggled? style['title-checked'] : style['title']}>{props.name}</p></div>
        <div>{props.icon}</div>
        <div>{props.date}</div>
        <div>{props.priority}</div>
        <div>{props.state}</div>
        <div className={style['end']}></div>
        </div>
)
}