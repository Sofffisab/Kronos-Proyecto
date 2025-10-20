import CreateProjectForm from "../components/Create Project/CreateProjectForm.jsx";
import { useState } from "react"
import Navbar from "../components/NavBar.jsx";

export default function CreateProjectPage() {

    const [formData, setFormData] = useState({})
    const [ step, setStep] = useState(1)
    const [ title, setTitle] = useState('¿Que estan preparando actualmente con tu equipo?')
    const nextStep = ()=> {
        loadFormData();
        setStep(step+1)
        if(step==2) {setTitle('¿Que tareas necesitas realizar en Plan para reducir '+formData.title)
        }

        else if(step==3)setTitle('¿Que forma de organización es la mejor para tu proyecto?¡Luego podes cambiarla!')

        else if(step==4) postForm()
    }
    const loadFormrData = ()=> {}

    return( <div className='createPage'>
        <Navbar/>
        <CreateProjectForm title={title}step={step} nextStep={nextStep}/>
        </div>)
}