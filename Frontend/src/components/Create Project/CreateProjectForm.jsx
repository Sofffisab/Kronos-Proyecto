import SimpleButton from '../SimpleButton.jsx'
import style from './create.module.css'
export default function CreateProjectForm(props) {



return(
    <div className={style.form}>
        <p>{props.title}</p>
        {(props.step== 1 || props.step== 2) && (
    <input placeholder= {props.step == 1 ?'ej: Plan para reducir consumo de plastico ' : 'ej: Reunion inicial para hacer brainstorming '}
     onChange={(event)=>props.setInput(event.target.value)} value={props.input}  onKeyDown={props.step == 2? (e) => e.key === "Enter" && props.addTask() : undefined}/>
        )}{props.step == 3 && (
<>
<SimpleButton class={style.selectBtn} text='Tablero' onClick={()=>props.setType('eq')} icon='equalizer'/>
<SimpleButton class={style.selectBtn} text='Lista' onClick={()=>props.setType('list')} icon='list'/>
<SimpleButton class={style.selectBtn} text='Calendario' onClick={()=>props.setType('cal')} icon='calendar_today'/>
</>

        )}

    


    <SimpleButton class={style.submitBtn}text='Siguiente' onClick={props.nextStep}/>
    </div>
)

}