import { useEffect, useState } from "react";
import styles from "./messages.module.css";
import Input from "./Input";
import Chat from "./Chat";
import { useTasks } from "../../../context/ProjectContext";
import { sendChatMessage } from "../../../../api/messages";

export default function Messages() {
  const { contextProject, contextChat, fetchMessages, setContextChat } = useTasks();
  const [input, setInput] = useState("");

  const chatId = contextProject.chats?.[0]?.id;


  useEffect(() => {
    if (chatId) {fetchMessages(chatId)
       console.log('chat loaded')}
      else setContextChat([]);
  }, [chatId]);

  const handleSend = () => {

    console.log('bege')
    if (input.trim()) {
      sendChatMessage(chatId, input);
      setInput("");
    }
  };

  return (
    <div className={styles.bigContainer}>
      <Chat messages={contextChat} />
      <Input
        msgValue={input}
        setMsgValue={(e) => setInput(e.target.value)}
        send={handleSend}
      />
    </div>
  );
}
