import Categorias from "./categorias";
import tasks from "../List/tasks";
import Tarea from "./Tarea";
export default function kanban() {

    const mappedTasks = {
        rTasks: tasks.filter((task) => task.type=='riesgo').map((task)=> <Tarea key={task.id}type={task.type} text={task.text}/>),
        aTasks: tasks.filter((task) => task.type=='atrasada').map((task)=> <Tarea key={task.id} type={task.type} text={task.text}/>),
        pTasks: tasks.filter((task) => task.type=='proceso').map((task)=> <Tarea key={task.id} type={task.type} text={task.text}/>),
        tTasks: tasks.filter((task) => task.type=='terminado').map((task)=> <Tarea key={task.id} type={task.type} text={task.text}/>)
    }

    return(
        <Categorias rTasks={mappedTasks.rTasks}
        aTasks={mappedTasks.aTasks}
    pTasks={mappedTasks.pTasks}
    tTasks={mappedTasks.tTasks}/>

    )
}