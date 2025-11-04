import { createContext, useContext, useState, useEffect } from "react";
import { getChatMessages } from "../../api/messages.js";
import {getProjects} from '../../api/project.js'

const TaskContext = createContext()

export function useTasks() {
    return useContext(TaskContext)
}

export function TaskProvider({children}) {

    const [userId, setUserId] = useState(null)
    const [contextProject, setProject] = useState({})
    const [contextTasks, setTasks] = useState([])
    const [currentId, setCurrentId]= useState(null)
    const [contextChat, setContextChat] = useState(null)


async function fetchProject(id) {

    const project = await getProjects(localStorage.getItem('token'), id)
    setProject(project)
    setTasks(project.tareas)
    

}
async function fetchMessages(id) {

    const messages = await getChatMessages(localStorage.getItem('token'), id)
    setContextChat(messages)
}

useEffect(()=>{
    if(currentId) fetchProject(currentId)
},[currentId])

useEffect(() => {
    if (contextProject.chats && contextProject.chats.length > 0) {
      fetchMessages(contextProject.chats[0].id);
    }
  }, [contextProject]);




return(
    <TaskContext.Provider value={{contextTasks, contextProject, fetchProject,setCurrentId, currentId, contextChat, userId, setUserId}}>{children}</TaskContext.Provider>
)}