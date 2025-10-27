import style from './create.module.css'
import Task from './Task'
export default function Window(props) {

const mappedTasks = props.tasks.slice(0,5).map((task)=><Task key={Math.random()} title={task}></Task>)

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
            {mappedTasks}
        </div>
    </div>

)

}