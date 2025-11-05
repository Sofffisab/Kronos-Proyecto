import SimpleButton from '../SimpleButton.jsx'
import style from './create.module.css'
import ProgressBar from "./ProgressBar.jsx";
export default function CreateProjectForm(props) {



return(
    <div className={style.form}>
        <ProgressBar step={props.step}
        style={props.step==1? {width:'33.33%'} : props.step==2? {width:'66.66%'} : props.step==3?{width:'100%'}: {}}
        />
        <div>
        <p className={`${style.mainTitle} ${ props.step!==1 && style.hidden }`}>¡Hagamos un royecto!</p>
        <p className={style.title}>{props.title}</p>
        </div>
        {(props.step== 1 || props.step== 2) && (
    <input className={style.input}placeholder= {props.step == 1 ?'ej: Plan para reducir consumo de plastico ' : 'ej: Reunion inicial para hacer brainstorming '}
     onChange={(event)=>props.setInput(event.target.value)} value={props.input}  onKeyDown={props.step == 2? (e) => e.key === "Enter" && props.addTask() : undefined}/>
        )}{props.step == 3 && (
<div className={style.selectBtnBox}>
<SimpleButton class={`${style.selectBtn} ${props.type== 'tab'  && style.focused}`} text='Tablero' onClick={()=>props.setType('tab')} icon='equalizer'/>
<SimpleButton class={`${style.selectBtn} ${props.type==  'list' && style.focused}`} text='Lista' onClick={()=>props.setType('list')} icon='list'/>
<SimpleButton class={`${style.selectBtn} ${props.type==  'cal' && style.focused}`} text='Calendario' onClick={()=>props.setType('cal')} icon='calendar_today'/>
</div>

        )}

    


    <SimpleButton class={style.submitBtn}text='Siguiente' onClick={props.nextStep}/>
    </div>
)

}