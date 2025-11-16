import { stringToColor } from '../../../../api/project.js'
import style from './messages.module.css'

export default function Bubble(props) {

const backgroundStyle = !props.own? {backgroundColor: stringToColor(props.owner)} : {}

return(

    <div className={style.txtBubble}>
        {( !props.own) && <label>{props.owner}</label>}
        <div className={style.container} style={backgroundStyle}>
        <p>{props.text}</p>
        {props.own && <span className='material-symbols-outlined'/>}
        </div>
    </div>
)

}