import './kanban.css'

export default function Categorias(props) {

    return(
        <div className='table'>
            <div className='top'>
            <div>En riesgo</div>
            <div>Atrasada</div>
            <div>En proceso</div>
            <div id='last'>Terminada</div>
            </div>
            <div className='bottom'>
                <div id='riesgo' onClick={()=>props.OnClick('riesgo')}>{props.rTasks }</div>
                <div id='atrasada'  onClick={()=>props.OnClick('atrasada')}>{props.aTasks}</div>
                <div id='proceso'  onClick={()=>props.OnClick('proceso')}>{props.pTasks}</div>
                <div id='terminada' onClick={()=>props.OnClick('terminado')}>{props.tTasks}</div>
            </div>
        </div>

    )
}