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
          onclick={props.sort}
        />
        <SimpleButton
          text="Filtrar"
          class={style["ordenarBtn"]}
          icon="filter_list"
          onclick={props.filter}
        />
        <SimpleButton class={style["ordenarBtn"]} icon="search" onclick={props.search} />
      </div>
    </div>
  );
}
