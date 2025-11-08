import SimpleButton from "../SimpleButton";
import BaseModal from "./BaseModal";
import { useNavigate } from "react-router";
import style from './modals.module.css'
import DisabledBg from "./DisabledBg";
import { useTasks } from "../../context/ProjectContext";
export default function AccountModal(props) {

    const {userPhoto} = useTasks()
    const navigate = useNavigate()

    const logOut = () => {
        localStorage.setItem('token', null)
        navigate('/')
    }

    return(
        <DisabledBg noOpacity={true}modal={
        <BaseModal style={style.accountModalBody}inputs={
            <div className={style.AccountModal}>
        <div className={style.userName}><img src={userPhoto}/><p>{props.name}</p></div>
        <SimpleButton text='Cerrar sesión' icon='logout' class={style.logoutBtn} onClick={logOut}/>
        </div>
        }/>} onClick={props.disableBg}/>
    )
}