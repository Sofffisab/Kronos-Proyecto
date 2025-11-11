import style from './ia.module.css'
import Section from './Section'

export default function IaPage(props) {

    
    return(
<div style={props.SbOpen?{marginLeft: '0px', width: '100%'} : {}} className={style.iaPage}>
    <div className={style.title}><img src='/public/graph.svg'/><p>Análisis de tu página web</p></div>
    <Section title='Tema de tu página web' placeholder='Tema de pagina...'/>
    <Section file={true} title='Imágen de una pantalla de tu página' placeholder='Inserte un archivo...'/>
    <Section title='Código de tu página' placeholder='Código de página...'/>

</div>
    )
    

}