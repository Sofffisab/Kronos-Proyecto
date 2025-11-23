import style from'./kanban.module.css'
export default function Tarea(props) {

    

    return(
       
        <div className={`${style.tarea} ${style[props.type]}`} onClick={(e) => e.stopPropagation()}>
            <span onClick={(e) => { e.stopPropagation(); props.setModal({ id: props.id, nombre: props.text }); }} className={`material-symbols-outlined ${style.closeBtn}`}>close</span>
            <p>{props.text}</p>
        </div>
            
    )
}