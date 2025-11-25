
import SimpleButton from '../SimpleButton'
import style from './modals.module.css'
export default function BaseModal(props) {

    return(

    <div className={props.style || style['baseModalBody']} onClick={(e) => e.stopPropagation()}>
       {props.title &&  <p className={`${style['baseModalTitle']} ${!props.nowrap && style.wrap}`}>{props.title}</p>}
        {props.inputs}
        {props.buttonTxt && <SimpleButton class={style['baseSubmit']} text={props.buttonTxt} onClick={props.submit}/>}
    </div> 
    )
}