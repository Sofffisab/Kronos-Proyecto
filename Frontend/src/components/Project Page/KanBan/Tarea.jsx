import './kanban.css'

export default function Tarea(props) {

    return(
        <div className={'tarea '+props.type} onClick={(e) => e.stopPropagation()}>
            <p>{props.text}</p>
        </div>

    )
}