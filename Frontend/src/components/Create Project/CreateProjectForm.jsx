import SimpleButton from '../SimpleButton.jsx'
import style from './create.module.css'
export default function CreateProjectForm(props) {



return(
    <div className={style.form}>
        <p>{props.title}</p>
    {props.step == 1 && <input placeholder='ej: Plan para reducir consumo de plastico ' onChange={(event)=>props.setTitle(event.target.value)}/>}




    <SimpleButton class={style.submitBtn}text='Siguiente' onClick={props.nextStep}/>
    </div>
)

}