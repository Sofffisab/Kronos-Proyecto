import { createContext, useContext, useState, useEffect } from "react";
import { getChatMessages } from "../../api/messages.js";
import { getProjects } from "../../api/project.js";
import {jwtDecode} from 'jwt-decode'
import {
  connectChatSocket,
  onChatMessage,
  disconnectChatSocket,
} from "../../api/messages.js";

const TaskContext = createContext();

export function useTasks() {
  return useContext(TaskContext);
}

export function TaskProvider({ children }) {
  const [user, setUser] = useState(null);
  const [contextProject, setProject] = useState({});
  const [contextTasks, setTasks] = useState([]);
  const [currentId, setCurrentId] = useState(null);
  const [contextChat, setContextChat] = useState([]);
  async function fetchProject(id) {
    const project = await getProjects(localStorage.getItem("token"), id);
    setProject(project);
    setTasks(project.tareas);
  }

 
  async function fetchMessages(chatId) {
    const messages = await getChatMessages(localStorage.getItem("token"), chatId);
    setContextChat(messages);
  }

  useEffect(()=>{
    const token = localStorage.getItem('token')
    if(!token) return

    const decoded = jwtDecode(token)
    setUser(decoded)
  },[contextProject])

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const socket = connectChatSocket(token);

    const unsubscribe = onChatMessage((data) => {
  
      if (data.id_chat === contextProject.chats?.[0]?.id) {
        setContextChat((prev) => {

          if (prev.some((msg) => msg.id === data.id)) return prev;
          return [...prev, data];
        });
      }
    });

    return () => {
      unsubscribe();
      disconnectChatSocket();
    };
  }, [contextProject.chats?.[0]?.id]);


  useEffect(() => {
    if (currentId) fetchProject(currentId);
  }, [currentId]);

  return (
    <TaskContext.Provider
      value={{
        contextTasks,
        contextProject,
        fetchProject,
        setCurrentId,
        fetchMessages,
        currentId,
        contextChat,
        setContextChat, 
        user,
        setUser,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
}
