
import style from './modals.module.css'
export default function DisabledBg(props) {
  return (
    <div onClick={props.onClick} style={props.noOpacity && {'backgroundColor':'transparent'}}className={style["bg"]}>
      
        {props.modal }
      
    </div>
  );
}
