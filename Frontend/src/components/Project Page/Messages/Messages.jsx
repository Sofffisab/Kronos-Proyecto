import { useEffect, useState } from 'react'
import styles from './messages.module.css'
import Input from './Input'
import Chat from './Chat'
import { useTasks } from '../../../context/ProjectContext'
import  {connectChatSocket,
onChatMessage,
sendChatMessage,
disconnectChatSocket,} from '../../../../api/messages'

export default function Messages() {

    const {contextProject, contextChat} = useTasks()
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const chatId = contextProject.chats[0].id
    
    useEffect(() => {
        if (contextChat) {
          setMessages(contextChat);
        }
      }, [contextChat]);

    useEffect(() => {
      const token = localStorage.getItem("token");
      if (!token) return console.error("No token found");
  
    
      const socket = connectChatSocket(token);
  
    
      const unsubscribe = onChatMessage((data) => {
        if (data.id_chat === chatId) {
          setMessages((prev) => [...prev, data]);
        }
      });
  
    
      return () => {
        unsubscribe();
     
      };
    }, [chatId]);
  
    const handleSend = () => {
      if (input.trim()) {
        sendChatMessage(chatId, input);
        setInput("");
      }
    };
    
    return(
        <div className={styles.bigContainer}>
        <Chat messages={messages}/>
        <Input msgValue={input} setMsgValue={(e)=> setInput(e.target.value)} send={handleSend}/>
        </div>
    )
}