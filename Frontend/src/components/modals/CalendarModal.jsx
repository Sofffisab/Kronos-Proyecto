import BaseModal from "./BaseModal";
import DisabledBg from "./DisabledBg";
import { useState } from "react";
export default function CalendarModal(props) {
const [title, setTitle]=useState("")
const [desc, setDesc]=useState("")
    return(
        <DisabledBg modal={<BaseModal title='Crear evento' submit={()=>props.submit(title,desc)} buttonTxt='crear'
        
            inputs={
                <div>
                    <label>Titulo</label>
                    <input id='title'
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}/>
                    <label>Descripción</label>
                    <input id='desc'
                    value={desc}
                    onChange={(e) => setDesc(e.target.value)}/>
                </div>

            }
        
        />} onClick={props.disableModal}/>
    )
}