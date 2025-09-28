import './list.css'
import Category from './Category'
import Bar from './Bar.jsx'
import Table from './table'
import Task from './Task'
export default function List(props) {

    const tasks = props.tasks.map((task) => <Task name={task.name} icon={task.icon} priority={task.priority}date={task.date} state={task.state} key={task.id}/>)
return(
    <>
    <Bar/>
    <Category/>
    <Table name='Tareas iniciadas'tasks={tasks}/>
    <Table name='Tareas pendientes'tasks={tasks}/>
    <Table name='Tareas finalizadas'tasks={tasks}/>
    
    
    </>
)

}