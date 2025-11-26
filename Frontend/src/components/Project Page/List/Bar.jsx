import SimpleButton from "../../SimpleButton";
import style from './list.module.css'
export default function Bar(props) {
  return (
    <div className={style["bar"]}>
      <SimpleButton
        text="Agregar tarea"
        class={style["agregarBtn"]}
        icon="add"
        onClick={props.onClick}
      />
      <div className={style["filterBox"]}>
        <SimpleButton
          text="Ordenar"
          class={style["ordenarBtn"]}
          icon="swap_vert"
          onClick={() => props.setSorted(!props.sorted)}
        />
        
      </div>
    </div>
  );
}
