import FancyTitle from "../FancyTitle";
import Separator from "../Separator";
import SimpleButton from "../SimpleButton";
import style from './PgContent.module.css'
export default function ProjectPgSelectBar(props) {

    return(
        <div className={style['topMenuPgContent']} >
    <div className={style['topMenuContentTitle']}>
<FancyTitle class={style['proyectosTitle']} text={props.projName? props.projName : 'Nombre del proyecto'}/>
<SimpleButton class={style['compartirBtn']} icon='lock' text='Compartir'/>
</div>
<div className={style['topMenuPgContentList']}>
    <p onClick={() => props.setSelected(1)} style={props.selected==1? {backgroundColor: '#A2A2A2'} : {}}>Calendario</p>
    <p onClick={() => props.setSelected(2)} style={props.selected==2? {backgroundColor: '#A2A2A2'} : {}}>Lista de Tareas</p>
    <p onClick={() => props.setSelected(3)} style={props.selected==3? {backgroundColor: '#A2A2A2'} : {}}>Tablero Kanban</p>
    <p onClick={() => props.setSelected(4)} style={props.selected==4? {backgroundColor: '#A2A2A2'} : {}}>Mensajes</p>
</div>
<Separator style={{width: '100%', position:'absolute', left: '0px', opacity: '30%'}}/>
</div>

    )
}