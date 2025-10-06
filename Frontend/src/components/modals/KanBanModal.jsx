import BaseModal from "./BaseModal";
import DisabledBg from "./DisabledBg";

export default function KanbanModal(props) {

return(
    <DisabledBg onClick={props.bgOnClick}
    modal={
        <BaseModal buttonTxt='Crear' title='Crear tarea' submit={props.submit}
                    inputs={
     <div className='kbModal'>
        <label>Nombre</label>
         <input id="name" />
         <label>Responsable</label>
         <select id="type">
          <option value="riesgo">En riesgo</option>
          <option value="atrasada">Atrasada</option>
          <option value="proceso">En proceso</option>
          <option value="terminado">Terminada</option>
        </select>
     </div>
                    }
        />

    }/>
    
    
)

}