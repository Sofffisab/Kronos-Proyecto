import { deleteEvent } from "../../../api/calendar";
import BaseModal from "./BaseModal";
import DisabledBg from "./DisabledBg";
import style from './modals.module.css'
import LoadingScreen from "../LoadingScreen";
import { useState } from "react";

export default function EventModal(props) {

    const [loading, setLoading] = useState(false)

    const eraseEvent = async () => {
        setLoading(true)
try {
        await deleteEvent(props.id, localStorage.getItem('token'))

        }
        catch(e) {console.log(e)}
        finally {
            props.disable()
            props.fetch()
            setLoading(false)
        }

        
    }
    if(loading) return <LoadingScreen/>

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