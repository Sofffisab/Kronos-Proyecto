import Separator from "../Separator";
import style from './ia.module.css'
export default function Section(props) {

    return(
        <div className={style.section}>
            <Separator/>
            <p>{props.title}</p>
            <Separator/>
           {props.file? <input placeholder={props.placeholder} type='file'/> : <textarea placeholder={props.placeholder}/>}
        </div>
    )
}