import DisabledBg from "./DisabledBg";
import style from './modals.module.css'
import BaseModal from "./BaseModal";
export default function InputModal(props) {
  const personas = props.members.map((p)=>(
    <option key={p.id} value={p.id}>{p.nombre}</option>
  ))
  return (
    <DisabledBg
      onClick={props.bgOnClick}
      modal={
      <BaseModal title='Crear un item' inputs={<div  className={style['inputModal']}> <label>Nombre</label>
        <input id="name" />
        <label>Responsable</label>
        <select id="person">
          {personas}
        </select>
        <label>Limite</label>
        <input id="date" type="date" />
        <label>prioridad</label>
        <select id="pri">
          <option value="high">High</option>
          <option value="mid">Mid</option>
          <option value="low">Low</option>
        </select>
        <label>Estado</label>
        <select id="state">
          <option value="pending">Pending</option>
          <option value='resolved'>Resolved</option>
        </select></div>} buttonTxt='Crear' submit={props.submit}/>
      }
    />
  );
}
