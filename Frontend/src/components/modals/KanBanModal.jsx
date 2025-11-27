import BaseModal from "./BaseModal";
import DisabledBg from "./DisabledBg";
import style from './modals.module.css'
export default function KanbanModal(props) {

return(
    <DisabledBg onClick={props.bgOnClick}
    modal={
        <BaseModal buttonTxt='Crear' title='Crear tarea' submit={props.submit}
                    inputs={
     <div className={style['kbModal']}>
        <label>Nombre</label>
         <input id="name" />
         <label>Responsable</label>
         <select id="type"  defaultValue={props.value}>
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