import style from './messages.module.css'

export default function Bubble(props) {

return(

    <div className={style.txtBubble}>
        {!props.own && <div className={style.user}/>}
        <div className={style.container}>
        <p>{props.text}</p>
        {props.own && <span className='material-symbols-outlined'/>}
        </div>
    </div>
)

}