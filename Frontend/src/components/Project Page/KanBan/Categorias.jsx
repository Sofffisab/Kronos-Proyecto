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
                <div id='riesgo'>{props.rTasks}</div>
                <div id='atrasada'>{props.aTasks}</div>
                <div id='proceso'>{props.pTasks}</div>
                <div id='terminada'>{props.tTasks}</div>
            </div>
        </div>

    )
}