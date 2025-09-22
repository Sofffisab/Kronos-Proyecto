import SimpleButton from "../../SimpleButton";

export default function Bar(props) {

    return(
        <div className='bar'>
            <SimpleButton text='Agregar tarea' class='agregarBtn' icon='add' onclick={props.add}/>
            <div id='filterBox'>
            <SimpleButton text='Ordenar'class='ordenarBtn' icon='swap_vert' onclick={props.sort}/>
            <SimpleButton text='Filtrar' class='ordenarBtn' icon='filter_list' onclick={props.filter}/>
            <SimpleButton  class='ordenarBtn' icon='search' onclick={props.search}/>
            </div>
        </div>
    )
}