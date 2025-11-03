import { createContext, useContext, useState, useEffect } from "react";
import {getProjects} from '../../api/project.js'

const TaskContext = createContext()

export function useTasks() {
    return useContext(TaskContext)
}

export function TaskProvider({children}) {

    const [contextProject, setProject] = useState({})
    const [contextTasks, setTasks] = useState([])
    const [currentId, setCurrentId]= useState(null)


async function fetchProject(id) {

    const project = await getProjects(localStorage.getItem('token'), id)
    setProject(project)
    setTasks(project.tareas)
    
}

useEffect(()=>{
    if(currentId) fetchProject(currentId)
},[currentId])



return(
    <TaskContext.Provider value={{contextTasks, contextProject, fetchProject,setCurrentId, currentId}}>{children}</TaskContext.Provider>
)}