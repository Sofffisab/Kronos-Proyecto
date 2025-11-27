import BaseModal from "./BaseModal";
import DisabledBg from "./DisabledBg";
import { useState } from "react";
import style from './modals.module.css'
export default function CalendarModal(props) {
const [title, setTitle]=useState("")
const [desc, setDesc]=useState("")
    return(
        <DisabledBg modal={<BaseModal title='Crear evento' submit={()=>props.submit(title,desc)} buttonTxt='crear'
        
            inputs={
                <div className={style.calendarModal}>
                    <div>
                    <label>Titulo</label>
                    <input id='title'
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}/>
                    </div>
                    <div>
                    <label>Descripción</label>
                    <input id='desc'
                    value={desc}
                    onChange={(e) => setDesc(e.target.value)}/>
                    </div>
                </div>

            }
        
        />} onClick={props.disableModal}/>
    )
}