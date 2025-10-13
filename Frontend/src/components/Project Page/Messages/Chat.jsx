import Bubble from './Bubble'
import style from './messages.module.css'

export default function(props) {
    
    let messageObj = []
    if(props.messages) messageObj = props.messages

    const messages =  messageObj.map((msg)=> (
        <div key={msg.key}className={msg.own? `${style.normalMsg} ${style.rightMsg}` : `${style.normalMsg} ${style.rightMsg}`}>
            <Bubble own={msg.own} text={msg.text}/>
        </div>
    ))

    return(
        <div className={style.chatLayout}>
            {messages}
        </div>

    )
}