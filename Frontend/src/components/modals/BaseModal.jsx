
import SimpleButton from '../SimpleButton'
import style from './modals.module.css'
export default function BaseModal(props) {

    return(

    <div className={style['baseModalBody']} onClick={(e) => e.stopPropagation()}>
        <p className={style['baseModalTitle']}>{props.title}</p>
        {props.inputs}
        <SimpleButton class={style['baseSubmit']} text={props.buttonTxt} onClick={props.submit}/>
    </div> 
    )
}