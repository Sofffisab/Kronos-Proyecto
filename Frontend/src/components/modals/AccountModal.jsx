import SimpleButton from "../SimpleButton";
import BaseModal from "./BaseModal";
import { useNavigate } from "react-router";
import style from './modals.module.css'
import DisabledBg from "./DisabledBg";
import { useTasks } from "../../context/ProjectContext";
import { useState } from "react";
import EditModal from "./EditModal";
export default function AccountModal(props) {
    const [modal, setModal] = useState(false)
    const {userPhoto} = useTasks()
    const navigate = useNavigate()
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
        <DisabledBg noOpacity={true}modal={
        <BaseModal style={style.accountModalBody}inputs={
            <div className={style.AccountModal}>
        <div className={style.userName}><img src={userPhoto || localStorage.getItem('pfp')}/><p>{props.mail}</p></div>
        <SimpleButton text='Personalización' icon='edit' class={style.editBtn} onClick={openEditModal}/>
        <SimpleButton text='Cerrar sesión' icon='logout' class={style.logoutBtn} onClick={logOut}/>
        </div>
        }/>} onClick={props.disableBg}/>
        </>
    )
}