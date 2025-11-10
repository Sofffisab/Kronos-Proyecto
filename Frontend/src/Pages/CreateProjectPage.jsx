import CreateProjectForm from "../components/Create Project/CreateProjectForm.jsx";
import { useState } from "react"
import Navbar from "../components/NavBar.jsx";
import Window from "../components/Create Project/Window.jsx";
import { postProject} from "../../api/project.js";
import { postTask } from "../../api/tasks.js";
import { useNavigate } from "react-router";
import LoadingScreen from '../components/LoadingScreen.jsx'
import { useTasks } from "../context/ProjectContext.jsx";
export default function CreateProjectPage() {
    const navigate = useNavigate()
    const {user} = useTasks()
    const [loading, setLoading] = useState(false)
    const [input, setInput] = useState('')
    const [ step, setStep] = useState(1)
    const [nombre, setNombre ] = useState('');
    const [tasks, setTasks ] = useState('');
    const [type, setType] = useState(null)
    const [ title, setTitle] = useState('¿Que estan preparando actualmente con tu equipo?')
    const nextStep = ()=> {
        const verify = loadFormData();
        if(!verify) return;
        const next = step+1
        setStep(next)
        if(next==2) {setTitle('¿Que tareas necesitas realizar en '+input+'?')
        }

        else if(next==3)setTitle('¿Que forma de organización es la mejor para tu proyecto?¡Luego podes cambiarla!')

        else if(next==4) createProject()
    }
    const loadFormData = ()=> {
        if(input.trim() == '' && step==1) return false; 
        if(rawTasks.length==0 && step==2) return false; 
        if(type== null && step==3) return false; 
        if(step==1) { 
            setNombre(input) 
            setInput('')}

        if(step == 2){
        
          if(tasks.length==0)  setTasks(rawTasks)
        }


             
        
        return true;
    }
    const createProject = async ()=> {
        try {
            setLoading(true)
          const project = await postProject(nombre, '2025-11-30', localStorage.getItem('token'), )
          console.log(project)
           for (const task of tasks) {
            await postTask(task.name,  '2025-11-30',user.id,  localStorage.getItem('token'),project.project.id, 'pending', 'mid')
            
           }
           
           navigate(`../project/${project.project.id}`)
        }
        catch(e) {
            console.log(e)
            navigate(`../project/${project.project.id}`)
            setLoading(false)
        }
    }
    const [rawTasks,setRawTasks] = useState([])
    const addTasks = ()=> {
        
         const today = new Date();
         const year = today.getFullYear();
        const month = today.getMonth();
        const day = Math.floor(Math.random() * 28) + 1; 

        const startDate = new Date(year, month, day);
        const states= ['iniciada', 'pendiente','realizada']
        const types= ['riesgo', 'atrasada', 'proceso','terminado']
        if(input=='' || input==null) return;
        setRawTasks([...rawTasks, {name:input, 
            allDay: true,
            title: input,
            text: input,
            state:states[Math.floor(Math.random()*3)],
            type:types[Math.floor(Math.random()*4)],
            start: startDate.toISOString().split('T')[0],
        }]);
        setInput('')
    }
if(loading) return(<LoadingScreen/>)
    return( <div className='createPage'>
        <Navbar/>
        <CreateProjectForm type={type}setType={setType} addTask={addTasks}input={input}title={title}step={step} nextStep={nextStep} setInput={setInput}/>
        <Window type={type}tasks={tasks? tasks : rawTasks}name={nombre? nombre : input}/>
        </div>)
}