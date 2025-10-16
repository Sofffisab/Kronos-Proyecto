import style from './list.module.css'
export default function Category() {

    return(
        <div className={style['category']}>
            <div >Nombre</div>
            <div>Responsable</div>
            <div>Limite</div>
            <div>Prioridad</div>
            <div>Estado</div>
            <div className={style['end']}></div>
            </div>
    )
}