import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'
import './Calendar.css'
import CalendarModal from '../../modals/CalendarModal.jsx'
import { useState } from 'react'
export default function Calendar(props) {
    const [date, setDate]= useState()
    const [tasks, setTasks] = useState([]);
    const [modal, toggleModal] = useState(false)
    const addTask = (info)=> {
        toggleModal(true);
        setDate(info.date)
    }
    const createTask = (title,desc, date)=> {
        const event = {
            id: Math.random().toString(),
            title: title,
            start: date
        }
        setTasks([...tasks, event])
        toggleModal(false)
    }

    return(
        <>
        {modal && <CalendarModal disableModal={()=>toggleModal(false)} submit={(title, desc)=>createTask(title, desc, date)}/>}
        <FullCalendar
        plugins={[ dayGridPlugin, interactionPlugin ]}
        initialView="dayGridMonth"
        customButtons={{year:{text: "year"}}}
        headerToolbar={{
            start: 'title', 
            center: '',
            end: 'prevYear prev today next nextYear' 
          }}
          selectable={true}
          dateClick={(info)=>addTask(info)}
          events={tasks}
       />
       </>
    )
}