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
import LoadingScreen from '../../LoadingScreen.jsx'
export default function Calendar(props) {

    const {currentId} = useTasks()
    const [date, setDate]= useState()
    const [tasks, setTasks] = useState(props.tasks? props.tasks :[]);
    const [modal, toggleModal] = useState(false)
    const [eModal, toggleEModal] = useState(false)
    const [modalData, setModalData ]= useState({})
    const [loggedIn, setLoggedIn] = useState(null)
    const [loading, setLoading] = useState(false)
    const triggerEModal = (info)=> {
        toggleEModal(true);
         setModalData( {
            title: info.event.title,
            date: toDateOnly(info.event.start)+' - '+toDateOnly(info.event.end),
            desc: info.event.extendedProps.desc,
            id: info.event.id
        })
        console.log(modalData)

    }
const load = async()=>{
    
        try {
            
            setLoggedIn(true)
        const event = await fetchEvents(localStorage.getItem('token'))
        setTasks(event)}
        catch(e) {console.log(e)
            setLoggedIn(false)
        }
    
    }
    useEffect(()=>{
        
        load()
    },[currentId])

    const addTask =  (info)=> {
        toggleModal(true);
        setDate({start: info.date? info.date : info.start, end: info.end})
    }
    const toDateOnly = (value)=> {
        if(!value) return null;
        const parsed = value instanceof Date? value : new Date(value);
        return parsed.toISOString().split('T')[0];
    }
    const createTask = async (title, desc, selectedDate)=> {
        const targetDate = selectedDate || date;
        if(!targetDate?.start) {
            console.error('No date selected for the new event');
            return;
        }
        const event = {
            summary: title,
            description: desc,
            start: {date: toDateOnly(targetDate.start)},
            end: {date: toDateOnly(targetDate.end? targetDate.end : targetDate.start)},
            
        }
        setLoading(true)
        try{
            
        const result = await postEvent(localStorage.getItem('token'),event)
        console.log(result)
        const events = await fetchEvents(localStorage.getItem('token'))
        setTasks(events)
        toggleModal(false)}
        catch(e) {
            console.log(e)
        }
        finally {
            setLoading(false)}
    }

    if(loading) return <LoadingScreen/>

    if( loggedIn || props.noLogin) return(
        <>
        {eModal && <EventModal id={modalData.id} title={modalData.title} date={modalData.date} desc={modalData.desc} fetch={load} disable={()=> toggleEModal(false)}/>}
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
    if(!loggedIn ) return(<SimpleButton  class='googleSyncButton'text='Sync google calendar' onClick={connectGoogleCalendar}/>)
}