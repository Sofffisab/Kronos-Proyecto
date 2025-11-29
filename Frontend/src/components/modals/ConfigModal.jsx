import { useState } from "react";
import BaseModal from "./BaseModal.jsx";
import DisabledBg from "./DisabledBg";
import style from './modals.module.css'
import { useTasks } from "../../context/ProjectContext.jsx";
import { updateProfile } from "../../../api/auth.js";
import LoadingScreen from "../LoadingScreen.jsx";
export default function ConfigModal(props) {

    const {userPhoto} = useTasks()
    
    
    const formatTime = (value) => {
  if (!value) return '';
  const date = new Date(value);        
  const hours = String(date.getUTCHours()).padStart(2, '0');
  const minutes = String(date.getUTCMinutes()).padStart(2, '0');
  const time = `${hours}:${minutes}`;

  return time;
};


    const [name, setName] = useState(props.name || '')
    const [workHoursStart, setWorkHoursStart] = useState((props.workHoursStart) ? formatTime(props.workHoursStart) : '')
    const [workHoursEnd, setWorkHoursEnd] = useState((props.workHoursEnd) ? formatTime(props.workHoursEnd) : '')
    const [loading, setLoading] = useState(false)
    
    const submit = async () => {

        if(name.trim()== '' && name== props.name && !workHoursEnd && !workHoursStart) return;
            setLoading (true)

            try{
                await updateProfile(localStorage.getItem('token'), name, workHoursStart, workHoursEnd)  
                props.logOut()
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false)
            }
        
    }
        if(loading) return <LoadingScreen/>
    return(<>
   
        <DisabledBg position={2} onClick={props.disableBg} modal={
            <BaseModal 
            submit={submit}
            buttonTxt='Guardar cambios'
            inputs={
                <>
                    <div style={{'justifyContent':'flex-start', 'width':'100%'}} className={style.userName}>
                        <input src={userPhoto || localStorage.getItem('pfp') || '../public/UserPicInsert.svg'}type="image"/>
                    <div>
                        <p>{props.name}</p>
                        <p className={style.email}>{props.mail}</p>
                        </div></div>
                        <div className={style.configModalBody}>
                            <div>
                                <label>Tu nombre completo</label>
                                <input value={name} onChange={e => setName(e.target.value)} placeholder="Bautista Gomez" type='text'/>
                            </div>

                            <div >
                                <label>Tu horario de trabajo</label>
                                <div className={style.workHours}>
                                <input value={workHoursStart} onChange={e => setWorkHoursStart(e.target.value)} type="time"/>
                                <input value={workHoursEnd} onChange={e => setWorkHoursEnd(e.target.value)} type="time"/>
                                </div>
                            </div>

                            
                        </div>
                </>

            }
            />
        }/>
        </>

    )
}