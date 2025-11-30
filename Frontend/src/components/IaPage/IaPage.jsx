import style from './ia.module.css'
import Section from './Section'
import SimpleButton from '../SimpleButton.jsx'
import { useEffect, useState } from 'react'
import SendIaModal from '../modals/SendIaModal'
import { getIaChat, sendChatToPython,saveIaData, fetchIaChats } from '../../../api/ia.js'
import UploadedSection from './UploadedSection.jsx'
import LoadingScreen from '../LoadingScreen.jsx'
import { useNavigate } from 'react-router'
import { useTasks } from '../../context/ProjectContext.jsx'

export default function IaPage(props) {
    const [disabled, setDisabled] = useState(true)
    const [topic, setTopic] = useState('');
    const [code, setCode] = useState([])
    const [image, setImage] = useState(null)
    const [imageBase64, setImageBase64] = useState(null)
    const [modal, setModal] = useState(false)
    const [loading, setLoading] = useState(false)
    const [result, setResult] = useState(null)
    const [showResult, setShowResult] = useState(false)
    const [resultCode, setResultCode] = useState(null)
    const [resultImage, setResultImage] = useState(null)
    const [resultTopic, setResultTopic] = useState(null)
    const [resultTable, setResultTable] = useState(null)
    const nav = useNavigate()
    const {getIaChats} = useTasks()

    // Normalize IA code payloads into data shapes the UI can render safely
    const normalizeImprovedCode = (codigo) => {
        if (!codigo) {
            return { summary: null, codePayload: null };
        }

        let parsed = codigo;

        if (typeof parsed === 'string') {
            try {
                parsed = JSON.parse(parsed);
            } catch (error) {
                return { summary: null, codePayload: parsed };
            }
        }

        if (Array.isArray(parsed)) {
            return { summary: null, codePayload: parsed };
        }

        if (typeof parsed === 'object') {
            const summary = parsed.markdown || parsed.summary || null;
            const filesSource = Array.isArray(parsed.files)
                ? parsed.files
                : Array.isArray(parsed.archivos)
                    ? parsed.archivos
                    : null;

            if (filesSource) {
                const files = filesSource.map((file, index) => ({
                    name: file.name || file.filename || file.path || `Archivo ${index + 1}`,
                    content: file.content || file.code || ''
                }));

                if (summary) {
                    files.unshift({ name: 'Resumen', content: summary });
                }

                return { summary, codePayload: files };
            }

            if (summary) {
                return { summary, codePayload: summary };
            }

            return { summary: null, codePayload: JSON.stringify(parsed, null, 2) };
        }

        return { summary: null, codePayload: String(parsed) };
    }

    const normalizeAnalysisTable = (tabla) => {
        if (!tabla) {
            return null;
        }

        let parsed = tabla;

        if (typeof parsed === 'string') {
            try {
                parsed = JSON.parse(parsed);
            } catch (error) {
                console.error('No se pudo parsear tabla_analisis:', error);
                return null;
            }
        }

        if (!Array.isArray(parsed)) {
            if (Array.isArray(parsed.rows)) {
                parsed = parsed.rows;
            } else if (Array.isArray(parsed.table_data)) {
                parsed = parsed.table_data;
            } else {
                return null;
            }
        }

        if (parsed.length === 0) {
            return null;
        }

        const columnSet = new Set();
        parsed.forEach((row) => {
            Object.keys(row || {}).forEach((key) => columnSet.add(key));
        });

        const preferredFirst = ['criterion_or_website', 'criterion', 'criterio'];
        const preferredLast = ['conclusion'];

        const columns = [
            ...preferredFirst.filter((col) => columnSet.has(col)),
            ...Array.from(columnSet).filter((col) => !preferredFirst.includes(col) && !preferredLast.includes(col)).sort(),
            ...preferredLast.filter((col) => columnSet.has(col)),
        ];

        const orderedRows = parsed.map((row) => (
            columns.map((col) => {
                const value = row?.[col];
                if (value === undefined || value === null) {
                    return '';
                }
                if (typeof value === 'string') {
                    return value;
                }
                try {
                    return JSON.stringify(value);
                } catch (error) {
                    return String(value);
                }
            })
        ));

        return {
            columns,
            rows: orderedRows,
        };
    }

    async function getChat() {
            setLoading(true);
            await getIaChats()
            try {
                const res = await getIaChat(props.pageId, localStorage.getItem('token'));
                
                
                if (res.pagina) {
                    
                    setTopic(res.pagina.tema || '');
                    
                
                    if (res.pagina.imagen_jpg) {
                        
                        
                        setImage(res.pagina.imagen_jpg);
                    }
                    
                    
                    if (res.pagina.codigo_json && Array.isArray(res.pagina.codigo_json)) {
                        setCode(res.pagina.codigo_json);
                    }
                    if(res.pagina.respuesta_ia) {setResult( JSON.parse(res.pagina.respuesta_ia))
                        
                    }
                }
            } catch (error) {
                console.error('Error fetching page:', error);
            }
            finally {
                
                setLoading(false);
            }
        }


    useEffect(()=> {
        if(props.pageId) getChat()
                else(setTopic(''), setCode([]), setImage(null), setImageBase64(null), setResult(null), setResultTable(null))
    }, [props.pageId])

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
        if (!file) {
            setImage(null);
            setImageBase64(null);
            return;
        }
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
            nav('/project/ia/'+res.pagina.pagina_id)
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

    const uploadToPython = async () => {  

        console.log('data uploaded')

        
           sendChatToPython(props.pageId, localStorage.getItem('token'));
          await new Promise(r => setTimeout(r, 5000));
           getChat();
           setModal(false);
          
        
      }

            const toggleResult = () => {
                const nextShowResult = !showResult;
                setShowResult(nextShowResult);

                if(!nextShowResult) {
                        return;
                }

                if(result?.status === 'failed' ) {
                        setResultTopic('Procesamiento de IA no disponible, intente mas tarde');
                        setResultCode(null);
                        setResultImage(null);
                    setResultTable(null);
                        return;
                }

                if( result?.status==='standby') {
                        setResultTopic('Procesamiento en curso, intente mas tarde');
                        setResultCode(null);
                        setResultImage(null);
                    setResultTable(null);
                        return;
                }

                if(result?.status === 'completed') {
                    setResultImage(result.referencia_diseno || null)  
                    const { summary, codePayload } = normalizeImprovedCode(result.codigo_mejorado)
                    setResultCode(codePayload)
                    setResultTopic(topic || 'Análisis completado. Revisa la tabla comparativa.')
                    setResultTable(normalizeAnalysisTable(result.tabla_analisis))
                }




             }
    

    if(loading)    return <LoadingScreen/>

    return(
        <>
        {modal && <SendIaModal process={props.pageId}submit={props.pageId? uploadToPython :sendIaFiles}disableBg={()=> setModal(false)}/>}
<div style={props.SbOpen?{marginLeft: '0px', width: '100%'} : {}} className={style.iaPage}>
    <div className={style.topBar}>
    <div className={style.title}><img src='/public/graph.svg'/><p>Análisis de tu página web</p></div>
    {!props.pageId && <SimpleButton onClick={()=>setModal(true)}text='Enviar' class={style.sendBtn} icon='upload' disabled={disabled}/>}
        { props.pageId && <div>
    {result && <SimpleButton onClick={toggleResult} text='Resultado' class={style.sendBtn} icon={showResult ? 'visibility_off' : 'visibility'} />}
    {props.pageId && <SimpleButton onClick={()=>setModal(true)}text={result?.status==='standby' ? 'Procesando...' : 'Procesar'} class={style.sendBtn} icon='upload' disabled={result?.status === 'standby'}/>}
    </div>}
    </div>
    {props.pageId?

    <>
    <UploadedSection title='Tema de tu pagina web' text={showResult? (resultTopic ?? topic) : topic}/>
    {showResult && resultTable && (
        <UploadedSection title='Tabla de análisis comparativo' table={resultTable}/>
    )}
    <UploadedSection title='Imágen de una pantalla de tu página' file={showResult? resultImage : image}/>
    <UploadedSection title='Código de tu página' code={showResult? resultCode : code}/>
    </>
    :
    <>
    <Section value={topic} onChange={setTopic} title='Tema de tu página web' placeholder='Tema de pagina...'/>
    <Section accept='image/*' file={true} title='Imágen de una pantalla de tu página' placeholder='Inserte un archivo...' setImage={handleImageFile}/>
    <Section accept='.html, .css, .js, .jsx, .ts, .py' file={true} multiple={true} onChange={handleCodeFiles} title='Código de tu página' placeholder='Código de página...'/>
    </>}   
</div>
</>
    )
    

}