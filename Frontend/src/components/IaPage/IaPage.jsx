import style from './ia.module.css'
import Section from './Section'
import SimpleButton from '../SimpleButton.jsx'
import { useEffect, useState } from 'react'
import SendIaModal from '../modals/SendIaModal'
import { saveIaData } from '../../../api/ia.js'
export default function IaPage(props) {

    const [disabled, setDisabled] = useState(true)
    const [topic, setTopic] = useState('');
    const [code, setCode] = useState([])
    const [image, setImage] = useState(null)
    const [imageBase64, setImageBase64] = useState(null)
    const [modal, setModal] = useState(false)

    const handleCodeFiles = async (files) => {
        const fileArray = Array.from(files);
        const filePromises = fileArray.map(file => {
            return new Promise((resolve) => {
                const reader = new FileReader();
                reader.onload = (e) => {
                    resolve({
                        name: file.name,
                        content: e.target.result
                    });
                };
                reader.readAsText(file);
            });
        });
        const filesData = await Promise.all(filePromises);
        setCode(filesData);
    };

    const handleImageFile = (file) => {
        setImage(file);
        const reader = new FileReader();
        reader.onload = (e) => {
            
            const base64String = e.target.result.split(',')[1];
            setImageBase64(base64String);
        };
        reader.readAsDataURL(file);
    };


    const sendIaFiles = async ()=> {
        console.log('Sending IA files:', { topic, imageBase64, code });

        try {
           const res = await saveIaData(topic, imageBase64, code, localStorage.getItem('token'))
            console.log('Response:', res)
            console.log('Datos enviados exitosamente!');
        }
        catch(e) {
            console.error('Error:', e)
            console.log('Error al enviar datos: ' + e.message);
        }
        finally {
            setModal(false)
        }
    }

    useEffect(()=>{
        if(imageBase64 && topic.length > 5 && code.length > 0) {
            setDisabled(false)
        }
        else setDisabled(true)
    }, [topic, imageBase64, code])
    
    return(
        <>
        {modal && <SendIaModal submit={sendIaFiles}disableBg={()=> setModal(false)}/>}
<div style={props.SbOpen?{marginLeft: '0px', width: '100%'} : {}} className={style.iaPage}>
    <div className={style.topBar}>
    <div className={style.title}><img src='/public/graph.svg'/><p>Análisis de tu página web</p></div>
    <SimpleButton onClick={()=>setModal(true)}text='Enviar' class={style.sendBtn} icon='upload' disabled={disabled}/>
    </div>
    <Section value={topic} onChange={setTopic} title='Tema de tu página web' placeholder='Tema de pagina...'/>
    <Section accept='image/*' file={true} title='Imágen de una pantalla de tu página' placeholder='Inserte un archivo...' setImage={handleImageFile}/>
    <Section accept='.html, .css, .js, .jsx, .ts, .py' file={true} multiple={true} onChange={handleCodeFiles} title='Código de tu página' placeholder='Código de página...'/>

</div>
</>
    )
    

}