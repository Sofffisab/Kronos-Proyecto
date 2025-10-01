import './kanban.css'

export default function Tarea(props) {

    return(
        <div className={'tarea '+props.type}>
            <p>{props.text}</p>
        </div>

    )
}