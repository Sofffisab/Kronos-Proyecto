import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'
import './Calendar.css'
import CalendarModal from '../../modals/CalendarModal.jsx'
import { useState } from 'react'
import EventModal from '../../modals/eventModal'
export default function Calendar(props) {
    const [date, setDate]= useState()
    const [tasks, setTasks] = useState([]);
    const [modal, toggleModal] = useState(false)
    const [eModal, toggleEModal] = useState(false)
    const [modalData, setModalData ]= useState({})
    const triggerEModal = (info)=> {
        toggleEModal(true);
         setModalData( {
            title: info.event.title,
            date: info.event.start+' - '+info.event.end,
            desc: info.event.extendedProps.desc,
        })

    }
    const addTask = (info)=> {
        toggleModal(true);
        setDate({start: info.date? info.date : info.start, end: info.end})
    }
    const createTask = (title,desc, date)=> {
        const event = {
            id: Math.random().toString(),
            title: title,
            start: date.start,
            end: date.end? date.end : date.start,
            allDay: true,
            extendedProps: {
                desc: desc},
        }
        setTasks([...tasks, event])
        toggleModal(false)
    }

    return(
        <>
        {eModal && <EventModal title={modalData.title} date={modalData.date} desc={modalData.desc} disable={()=> toggleEModal(false)}/>}
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
          select={(info)=> addTask(info)}
          events={tasks}
          eventClick={(info)=> triggerEModal(info)}
       />
       </>
    )
}