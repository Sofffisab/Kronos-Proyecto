import './modals.css'
import SimpleButton from '../SimpleButton'
export default function BaseModal(props) {

    return(

    <div className='baseModalBody' onClick={(e) => e.stopPropagation()}>
        <p className='baseModalTitle'>{props.title}</p>
        {props.inputs}
        <SimpleButton class='baseSubmit' text={props.buttonTxt} onClick={props.submit}/>
    </div> 
    )
}