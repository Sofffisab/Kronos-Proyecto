import DisabledBg from "./DisabledBg";
import "./modals.css";
import SimpleButton from "../SimpleButton";
export default function InputModal(props) {
  return (
    <DisabledBg
      onClick={props.bgOnClick}
      modal={
        <div className="inputModal">
          <p>Crear un item</p>

          <label>Nombre</label>
          <input id="name" />
          <label>Responsable</label>
          <select id="person">
            <option value="bege">Bege</option>
            <option value="pipa">pipa</option>
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
            <option value="Resolved">Resolved</option>
            <option value="Unresolved">Unresolved</option>
          </select>
          <SimpleButton text="Crear" onClick={props.submit} />
        </div>
      }
    />
  );
}
