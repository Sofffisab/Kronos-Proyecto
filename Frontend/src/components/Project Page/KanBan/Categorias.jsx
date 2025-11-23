import style from'./kanban.module.css'

export default function Categorias(props) {

    

    return(
        <div className={style['table']}>
            <div className={style['top']}>
            <div>En riesgo</div>
            <div>Atrasada</div>
            <div>En proceso</div>
            <div className={style['last']}>Terminada</div>
            </div>
            <div className={style['bottom']}>
                <div id='riesgo' onClick={()=>props.OnClick('riesgo')}>{props.rTasks }</div>
                <div id='atrasada'  onClick={()=>props.OnClick('atrasada')}>{props.aTasks}</div>
                <div id='proceso'  onClick={()=>props.OnClick('proceso')}>{props.pTasks}</div>
                <div id='terminada' onClick={()=>props.OnClick('terminado')}>{props.tTasks}</div>
            </div>
        </div>

    )
}