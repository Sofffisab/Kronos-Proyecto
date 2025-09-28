import { Link } from "react-router"

export default function SimpleButton(props) {

return(

<Link className={props.class} to={props.link}><span className='material-symbols-outlined'>{props.icon}</span><button onClick={props.onClick} disabled={props.disabled} 
>{props.text}</button></Link>



)

}