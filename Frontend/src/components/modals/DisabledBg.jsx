
import style from './modals.module.css'
export default function DisabledBg(props) {

  const position = props.position==1? 100 : props.position==2? 101 : props.position==3? 102 : 100
const opacity = props.noOpacity? 'transparent' : ''
  return (
    <div onClick={props.onClick} style={ {'backgroundColor':opacity, 'zIndex': position,}}className={style["bg"]}>
      
        {props.modal }
      
    </div>
  );
}
