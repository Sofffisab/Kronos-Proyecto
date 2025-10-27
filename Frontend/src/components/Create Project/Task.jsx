import style from './create.module.css'
import Separator from '../Separator.jsx'

export default function Task(props) {

    return(
        <div className={style.task}>
            <Separator/>
            <div><span className='material-symbols-outlined'>check_box</span><p>{props.title}</p></div>
        </div>
    )
}