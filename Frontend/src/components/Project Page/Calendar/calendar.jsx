import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'
import './Calendar.css'
import CalendarModal from '../../modals/CalendarModal.jsx'
import { useEffect, useState } from 'react'
import EventModal from '../../modals/eventModal'
import { useTasks } from '../../../context/ProjectContext.jsx'
import { connectGoogleCalendar, fetchEvents, postEvent } from '../../../../api/calendar.js'
import SimpleButton from '../../SimpleButton.jsx'
export default function Calendar(props) {

    const {currentId} = useTasks()
    const [date, setDate]= useState()
    const [tasks, setTasks] = useState(props.tasks? props.tasks :[]);
    const [modal, toggleModal] = useState(false)
    const [eModal, toggleEModal] = useState(false)
    const [modalData, setModalData ]= useState({})
    const [loggedIn, setLoggedIn] = useState(null)
    const triggerEModal = (info)=> {
        toggleEModal(true);
         setModalData( {
            title: info.event.title,
            date: info.event.start+' - '+info.event.end,
            desc: info.event.extendedProps.desc,
        })

    }

    useEffect(()=>{
        const load = async()=>{
        try {
            setLoggedIn(true)
        const event = await fetchEvents(localStorage.getItem('token'))
        setTasks(event)}
        catch(e) {console.log(e)
            setLoggedIn(false)
        }}
        load()
    },[currentId])

    const addTask =  (info)=> {
        toggleModal(true);
        setDate({start: info.date? info.date : info.start, end: info.end})
    }
    const createTask = async (title, date)=> {
        const event = {
            summary: title,
            start: date.start,
            end: date.end? date.end : date.start,
            
        }
        try{
        const result = await postEvent(localStorage.getItem('token'),event)
        console.log(result)
        const events = await fetchEvents(localStorage.getItem('token'))
        setTasks(events)
        toggleModal(false)}
        catch(e) {
            console.log(e)
        }
    }

    if( loggedIn) return(
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
          selectable={props.selectable && true}
          dateClick={props.selectable && ((info)=>addTask(info))}
          select={props.selectable &&((info)=> addTask(info))}
          events={tasks}
          eventClick={(info)=> triggerEModal(info)}
       />
       </>
    )
    if(!loggedIn) return(<SimpleButton  class='googleSyncButton'text='Sync google calendar' onClick={connectGoogleCalendar}/>)
}