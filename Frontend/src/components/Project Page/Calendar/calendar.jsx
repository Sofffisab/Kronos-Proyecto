import FullCallendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import './Calendar.css'
export default function Calendar(props) {

    return(
        <FullCallendar
        plugins={[ dayGridPlugin ]}
        initialView="dayGridMonth"
        customButtons={{year:{text: "year"}}}
        headerToolbar={{
            start: 'title', 
            center: '',
            end: 'prevYear prev today next nextYear' 
          }}
       />
    )
}