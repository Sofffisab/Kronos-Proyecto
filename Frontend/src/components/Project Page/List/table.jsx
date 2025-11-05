import { useState } from "react";
import Separator from "../../Separator";
import styles from './list.module.css'
export default function Table(props) {
  const [toggleTasks, setToggleTasks] = useState(true);
  const style = toggleTasks ? "tasks" : "tasksCollapsed";

  return (
    <div className={styles["listTable"]}>
      <div>
        <span
          onClick={() => setToggleTasks(!toggleTasks)}
          className="material-symbols-outlined"
        >
          keyboard_arrow_{toggleTasks ? "down" : "up"}
        </span>
        {props.name}
      </div>
      <div className={styles[style]}>{props.tasks}</div>
      <Separator />
      <p className={styles.agregarTxt}onClick={()=>props.onClick()}>Agregar tarea...</p>
    </div>
  );
}
