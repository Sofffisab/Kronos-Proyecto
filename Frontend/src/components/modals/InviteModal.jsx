import BaseModal from "./BaseModal";
import DisabledBg from "./DisabledBg";
import { useState } from "react";
import { useTasks } from "../../context/ProjectContext";
import style from './modals.module.css'
export default function InviteModal(props) {
    const {currentId} = useTasks()
    const [mail, setMail]=useState("")

    return(
        <DisabledBg modal={<BaseModal title={'Invita a alguien a '+props.name} submit={()=>props.submit(currentId, mail, localStorage.getItem('token'))} buttonTxt='invitar'
        
        inputs={
            <div className={style.inviteModal}>
                <div>
                <label>Mail del usuario</label>
                <input type="email" id='mail'
                value={mail}
                onChange={(e) => setMail(e.target.value)}/>
                </div>
            </div>

        }
    
    />} onClick={props.disableModal}/>
    )
}