import { Link } from "react-router"

export default function SimpleButton(props) {

if(props.link) {
    return(<Link className={props.class} to={props.link}><span className='material-symbols-outlined'>{props.icon}</span>{props.text && <button  disabled={props.disabled} 
    >{props.text}</button>}</Link>)
}
return(<div onClick={props.onClick} className={props.class} ><span className='material-symbols-outlined'>{props.icon}</span>{props.text && <button  disabled={props.disabled} 
>{props.text}</button>}</div>)

}