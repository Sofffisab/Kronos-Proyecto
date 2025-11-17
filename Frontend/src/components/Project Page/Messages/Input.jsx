import styles from './messages.module.css'
import SimpleButton from '../../SimpleButton.jsx'
export default function Input(props) {




    return(

        <div className={styles.inputContainer}>
            <SimpleButton icon='add' onClick={props.openModal}/>
            <input onKeyDown={(e) => e.key === "Enter" && props.send()}type='text' value={props.msgValue} onChange={props.setMsgValue}  placeholder='mensaje'/>
            <SimpleButton class='sendBtn'icon='send' onClick={props.send}/>
        </div>

    )
}