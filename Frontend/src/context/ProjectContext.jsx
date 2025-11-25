import { createContext, useContext, useState, useEffect } from "react";
import { getChatMessages } from "../../api/messages.js";
import { getProjects } from "../../api/project.js";
import {jwtDecode} from 'jwt-decode'
import { useNavigate } from "react-router";
import {
  connectChatSocket,
  onChatMessage,
  disconnectChatSocket,
} from "../../api/messages.js";
import { fetchIaChats } from "../../api/ia.js";

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
  const [userPhoto, setUserPhoto] = useState()
  const [error, setError] = useState(null)
  const [iaChats, setIaChats] = useState([]);
const [variables, setVariables] = useState()


async function getIaChats() {
  try {
    const res = await fetchIaChats(localStorage.getItem('token'))
    console.log(res)
    setIaChats(res)
  }
  catch(e) {
    console.log(e)
  }
}

  async function fetchProject(id) {
    try {
      setError(false)
      const project = await getProjects(localStorage.getItem("token"), id);
    setProject(project);
    setTasks(project.tareas ||[]);}
    catch(e) {
      setError(true)
    }
  }

  function setCSSVariables(name, value) {
    document.documentElement.style.setProperty(name, value);
    localStorage.setItem(name, value); 
    
  } 

  const updateVariables = (pallete) => {
    
   const colors =  pallete=='blue'? {secondary: '#AFC8BD', tertiary: '#678C99', darkerTertiary: '#C3CCAE'} :
                    pallete=='gray'? {secondary: '#D6C292', tertiary: '#FFF1CF', darkerTertiary: '#B8C7CC'} :
                    pallete=='orange'? {secondary: '#FFD137', tertiary: '#D98C2D', darkerTertiary: '#FF5E45'} : 
                    pallete=='pink'? {secondary: '#EC89A5', tertiary: '#A25C78', darkerTertiary: '#6F3A51'} :
                    pallete=='purple'? {secondary: '#B854A7', tertiary: '#654085', darkerTertiary: '#283464'} :
                    pallete=='yellow'? {secondary: '#F3FFCB', tertiary: '#FFFC94', darkerTertiary: '#FFD650'} : 
                   null
                   
  if(colors) {setCSSVariables('--secondaryColor', colors.secondary);
  setCSSVariables('--tertiaryColor', colors.tertiary);
  setCSSVariables('--darkerTertiaryColor', colors.darkerTertiary);}
  }


  useEffect(()=> {
   
    const pallete = localStorage.getItem('pallete')
    if(pallete) setVariables(pallete)
    updateVariables(pallete)
  },[])

  useEffect(()=>{
    if (!variables) return;
    localStorage.setItem('pallete', variables)
    updateVariables(variables)
  },[variables])


 
  async function fetchMessages(chatId) {
    const messages = await getChatMessages(localStorage.getItem("token"), chatId);
    setContextChat(messages)
    }
  
  



  useEffect(()=>{

    if(userPhoto) localStorage.setItem('pfp', userPhoto)
    const token = localStorage.getItem('token')
    if(token) {
    const decoded = jwtDecode(token)
    setUser(decoded)}
  },[userPhoto])

  


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

    if (currentId)  fetchProject(currentId)
    

    
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
        userPhoto,
        setUserPhoto,
        setVariables,
        error,
        setError,
        getIaChats,
        iaChats
      }}
    >
      {children}
    </TaskContext.Provider>
  );
}
