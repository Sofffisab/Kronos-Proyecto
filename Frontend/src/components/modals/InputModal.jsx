import DisabledBg from "./DisabledBg";
import style from './modals.module.css'
import BaseModal from "./BaseModal";
export default function InputModal(props) {
  return (
    <DisabledBg
      onClick={props.bgOnClick}
      modal={
      <BaseModal title='Crear un item' inputs={<div  className={style['inputModal']}> <label>Nombre</label>
        <input id="name" />
        <label>Responsable</label>
        <select id="person">
          <option value="bege">Bege</option>
          <option value="pipa">pipa</option>
          <option value="mathias">mathias</option>
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
          <option value="iniciada">Iniciada</option>
          <option value="pendiente">Pendiente</option>
          <option value='realizada'>Realizada</option>
        </select></div>} buttonTxt='Crear' submit={props.submit}/>
      }
    />
  );
}
