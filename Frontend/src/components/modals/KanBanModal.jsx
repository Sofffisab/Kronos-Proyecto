import BaseModal from "./BaseModal";
import DisabledBg from "./DisabledBg";
import style from './modals.module.css'
export default function KanbanModal(props) {

    console.log(props.value)
    const dfValue = props.value== 'riesgo'? 'pending' : props.value== 'atrasada'? 'delayed' : props.value== 'proceso'? 'in-progress' : props.value== 'terminado'? 'done' : 'pending'
return(
    <DisabledBg onClick={props.bgOnClick}
    modal={
        <BaseModal buttonTxt='Crear' title='Crear tarea' submit={props.submit}
                    inputs={
     <div className={style['kbModal']}>
        <label>Nombre</label>
         <input id="name" />
         <label>Responsable</label>
         <select id="type"  defaultValue={dfValue}>
          <option value="pending">En riesgo</option>
          <option value="delayed">Atrasada</option>
          <option value="in-progress">En proceso</option>
          <option value="done">Terminada</option>
        </select>
     </div>
                    }
        />

    }/>
    
    
)

}