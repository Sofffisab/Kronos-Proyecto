import { useState } from 'react'
import styles from './messages.module.css'
import Input from './Input'
import Chat from './Chat'

export default function Messages() {

    const [messages, setMessages]= useState(null)
    const [msgValue, setMsgValue]= useState('')

    const updateMsg = ()=> {
        if(msgValue.trim()) {
            setMessages([...messages || [], {text: msgValue, own: true, key: Math.random()}])
            setMsgValue('')
        }

    }

    return(
        <div className={styles.bigContainer}>
        <Chat messages={messages}/>
        <Input msgValue={msgValue} setMsgValue={(e)=> setMsgValue(e.target.value)} send={updateMsg}/>
        </div>
    )
}