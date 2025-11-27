import { useState } from "react";
import BaseModal from "./BaseModal.jsx";
import DisabledBg from "./DisabledBg";
import style from './modals.module.css'
import { useTasks } from "../../context/ProjectContext.jsx";
export default function EditModal(props) {

    const [selected, setSelected] = useState(null)
    const {setVariables} = useTasks()
      
    const setVariable = (pallete) => {
        setSelected(pallete)
        setVariables(pallete)
    }


    return(
        <DisabledBg position={2} onClick={props.disableBg} modal={
            <BaseModal title='Personaliza tu paleta en KRONOS'
            inputs={
                <div className={style.palleteBox}>
                    <input className={selected=='blue'? style.selected : ''} type='image' src='/public/palletes/blue.svg' onClick={()=>setVariable('blue')}/>
                    <input className={selected=='gray'? style.selected : ''} type='image' src='/public/palletes/gray.svg' onClick={()=>setVariable('gray')}/>
                    <input className={selected=='orange'? style.selected : ''} type='image' src='/public/palletes/orange.svg' onClick={()=>setVariable('orange')}/>
                    <input className={selected=='pink'? style.selected : ''} type='image' src='/public/palletes/pink.svg' onClick={()=>setVariable('pink')}/>
                    <input className={selected=='purple'? style.selected : ''} type='image' src='/public/palletes/purple.svg' onClick={()=>setVariable('purple')}/>
                    <input className={selected=='yellow'? style.selected : ''} type='image' src='/public/palletes/yellow.svg' onClick={()=>setVariable('yellow')}/>
                </div>

            }
            />
        }/>

    )
}