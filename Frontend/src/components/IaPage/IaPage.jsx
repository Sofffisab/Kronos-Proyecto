import style from './ia.module.css'
import Section from './Section'
import SimpleButton from '../SimpleButton.jsx'
import { useEffect, useState } from 'react'
import SendIaModal from '../modals/SendIaModal'
export default function IaPage(props) {

    const [disabled, setDisabled] = useState(true)
    const [topic, setTopic] = useState('');
    const [code, setCode] = useState('')
    const [image, setImage] = useState(null)
    const [modal, setModal] = useState(false)

    useEffect(()=>{

        if(image && topic.length>5 && code.length>5) {

            setDisabled(false)

        }

        else setDisabled(true)

    }, [topic, image, code])
    
    return(
        <>
        {modal && <SendIaModal disableBg={()=> setModal(false)}/>}
<div style={props.SbOpen?{marginLeft: '0px', width: '100%'} : {}} className={style.iaPage}>
    <div className={style.topBar}>
    <div className={style.title}><img src='/public/graph.svg'/><p>Análisis de tu página web</p></div>
    <SimpleButton onClick={()=>setModal(true)}text='Enviar' class={style.sendBtn} icon='upload' disabled={disabled}/>
    </div>
    <Section value={topic} onChange={setTopic} title='Tema de tu página web' placeholder='Tema de pagina...'/>
    <Section file={true} title='Imágen de una pantalla de tu página' placeholder='Inserte un archivo...' setImage={setImage}/>
    <Section value={code} onChange={setCode} title='Código de tu página' placeholder='Código de página...'/>

</div>
</>
    )
    

}