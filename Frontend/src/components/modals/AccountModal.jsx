import SimpleButton from "../SimpleButton";
import BaseModal from "./BaseModal";
import { useNavigate } from "react-router";
import style from './modals.module.css'
import DisabledBg from "./DisabledBg";
import ConfigModal from "./ConfigModal";
import { useTasks } from "../../context/ProjectContext";
import { useState } from "react";
import EditModal from "./EditModal";
export default function AccountModal(props) {
    const [modal, setModal] = useState(false)
    const {userPhoto} = useTasks()
    const navigate = useNavigate()

    const [configModal, setConfigModal] = useState(false)
    
    const openEditModal = ()=>{
        
        setModal(true)
    }

    
    const logOut = () => {
        localStorage.removeItem('token')
                localStorage.removeItem('pfp')
        navigate('/')
    }

    return(
        <>
        {modal && <EditModal disableBg={()=>setModal(false)}/>}
        {configModal && <ConfigModal workHoursStart={props.workHoursStart} workHoursEnd={props.workHoursEnd} logOut={logOut} name={props.name} mail={props.mail} disableBg={()=>setConfigModal(false)}/>}
        <DisabledBg noOpacity={true}modal={
        <BaseModal style={style.accountModalBody}inputs={
            <div className={style.AccountModal}>
        <div className={style.userName}><img src={userPhoto || localStorage.getItem('pfp')}/>
        <div
        ><p>{props.name}</p>
        <p className={style.email}>{props.mail}</p>
        </div></div>
        
        <div className={style.accModalBtns}>
        <SimpleButton text='Personalización' icon='edit' class={style.editBtn} onClick={openEditModal}/>
        <SimpleButton text='Configuracion' icon='settings' class={style.editBtn} onClick={() => setConfigModal(true)}/>
        <SimpleButton text='Cerrar sesión' icon='logout' class={style.logoutBtn} onClick={logOut}/>
        </div>
        </div>
        }/>} onClick={props.disableBg}/>
        </>
    )
}