import Bubble from './Bubble'
import style from './messages.module.css'

export default function(props) {
    
    let messageObj = []
    if(props.messages) messageObj = props.messages

    const mapMsg =(messageObj)=> {if(messageObj.length>0)  { return(messageObj.map((msg)=> (
        <div key={msg.id}className={msg.own? `${style.normalMsg} ${style.rightMsg}` : `${style.normalMsg} ${style.rightMsg}`}>
            <Bubble own={msg.own} text={msg.mensaje}/>
        </div>
    )))}else  return <p className={style.noMsg}>No new messages...</p>}

    return(
        <div className={style.chatLayout}>
            {mapMsg(messageObj)}
        </div>

    )
}