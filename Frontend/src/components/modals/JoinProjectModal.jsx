import BaseModal from "./BaseModal";
import DisabledBg from "./DisabledBg";
import style from './modals.module.css'
export default function JoinProjectModal(props) {

    const handleChange = (e)=> {
        props.onChange(e.target.value)
    }

    return(
        <DisabledBg onClick={props.disableBg} modal={
        <BaseModal
        title='¡Unite a un proyecto!'
        inputs={<div className={style.inviteModal}>
            <div >
            <label>Codigo del proyecto</label>
            <input value={props.value} onChange={handleChange} type="text" /></div></div>}
            buttonTxt='Unirse'
            submit={props.submit}/>}/>
    )
}