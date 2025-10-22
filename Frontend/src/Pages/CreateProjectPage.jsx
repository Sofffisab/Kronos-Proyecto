import CreateProjectForm from "../components/Create Project/CreateProjectForm.jsx";
import { useState } from "react"
import Navbar from "../components/NavBar.jsx";

export default function CreateProjectPage() {

    const [formData, setFormData] = useState({})
    const [input, setInput] = useState('')
    const [ step, setStep] = useState(1)
    const [nombre, setNombre ] = useState('');
    const [tasks, setTasks ] = useState('');
    const [type, setType] = useState(null)
    const [ title, setTitle] = useState('¿Que estan preparando actualmente con tu equipo?')
    const nextStep = ()=> {
        loadFormData();
        const next = step+1
        setStep(next)
        if(next==2) {setTitle('¿Que tareas necesitas realizar en Plan para reducir '+formData.nombre)
        }

        else if(next==3)setTitle('¿Que forma de organización es la mejor para tu proyecto?¡Luego podes cambiarla!')

        else if(next==4) postForm()
    }
    const loadFormData = ()=> {
        if(input.trim() !== ''){ 
        if(step==1) { 
            setNombre(input) 
            setInput('')}

        if(step == 2){
        
          if(tasks.length==0)  setTasks[rawTasks]
        }

             
        

    }}
    const rawTasks = []
    const addTasks = ()=> {
        rawTasks.push(input);
        setInput('')
    }

    return( <div className='createPage'>
        <Navbar/>
        <CreateProjectForm addTask={addTasks}input={input}title={title}step={step} nextStep={nextStep} setInput={setInput}/>
        </div>)
}