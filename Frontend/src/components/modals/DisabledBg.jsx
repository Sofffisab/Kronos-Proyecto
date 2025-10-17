import "./modals.css";
import style from './modals.module.css'
export default function DisabledBg(props) {
  return (
    <div onClick={props.onClick} className={style["bg"]}>
      
        {props.modal }
      
    </div>
  );
}
