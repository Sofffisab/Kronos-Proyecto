import { deleteEvent } from "../../../api/calendar";
import BaseModal from "./BaseModal";
import DisabledBg from "./DisabledBg";
import style from './modals.module.css'

export default function EventModal(props) {

    const eraseEvent = async () => {

        await deleteEvent(props.id, localStorage.getItem('token'))

        props.disable()
        props.fetch()

        
    }

    return(
        <DisabledBg onClick={props.disable} modal={
            <BaseModal title='evento' buttonTxt='cerrar' submit={props.disable} inputs={
                <div className={style.eventModal}>
                    <span onClick={eraseEvent}className={`material-symbols-outlined`}>close</span>
                    <label>Titulo:</label>
                <p>{props.title}</p>
                <label>Description:</label>
                <p>{props.desc}</p>
                <label>Date:</label>
                <p>{props.date}</p>
                </div>
            }/>
        }/>

    )
}