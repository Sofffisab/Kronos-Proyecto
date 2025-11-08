import style from './create.module.css'
import Task from './Task'
import KanBan from '../Project Page/KanBan/Kanban.jsx'
import List from '../Project Page/List/List.jsx'
import Calendar from '../Project Page/Calendar/Calendar.jsx'
export default function Window(props) {

const mappedTasks = props.tasks.slice(0,6).map((task)=><Task key={Math.random()} title={task.name}></Task>)

return(

    <div className={style.window}>
        <div className={style.topBar}>
            <div>
                <span className='material-symbols-outlined'>remove</span>
                <span className='material-symbols-outlined'>select_window</span>
                <span className='material-symbols-outlined'>close</span>
            </div>
        </div>
        <div className={style.windowTitle}>
            <div>
                <span className={`material-symbols-outlined ${style.listIcon}`}>list</span>
                <p>{props.name}</p>
            </div>
        </div>
        <div className={style.tasks}>
            {props.type=='cal'? <Calendar noLogin={true}tasks={props.tasks}/>: 
            props.type=='tab'? <KanBan tasks={props.tasks}/>: 
            props.type=='list'? <div className={style.listDiv}><List tasks={props.tasks}/></div>
            :mappedTasks}
        </div>
    </div>

)

}