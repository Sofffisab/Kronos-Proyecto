import SimpleButton from "../SimpleButton";
import BaseModal from "./BaseModal";
import { useNavigate } from "react-router";
import style from './modals.module.css'
import DisabledBg from "./DisabledBg";
export default function AccountModal(props) {

    const navigate = useNavigate()

    const logOut = () => {
        localStorage.setItem('token', null)
        navigate('/')
    }

    return(
        <DisabledBg modal={
        <BaseModal inputs={
            <div>
        <div><img/><p>{props.name}</p></div>
        <SimpleButton text='Cerrar sesión' icon='logout' class={style.logoutBtn} onClick={logOut}/>
        </div>
        }/>} onClick={props.disableBg}/>
    )
}