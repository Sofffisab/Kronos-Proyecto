import style from'./kanban.module.css'

export default function Tarea(props) {

    return(
        <div className={`${style.tarea} ${style[props.type]}`} onClick={(e) => e.stopPropagation()}>
            <p>{props.text}</p>
        </div>

    )
}