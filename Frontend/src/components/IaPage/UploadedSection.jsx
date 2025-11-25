
import Separator from "../Separator";
import style from './ia.module.css'

export default function UploadedSection(props) {

    return(

 <div className={style.section}>
            <Separator/>
            <p >{props.title}</p>
            <Separator/>
           {props.file? <img className={style.uploadedImage}src={props.file} alt={props.title}/> :props.text?
            <p className={style.uploadedTitle}>{props.text}</p> : props.code?
            <div>
                {Array.isArray(props.code) ? (
                    props.code.map((file, index) => (
                        <div key={index}>
                            <h4>{file.name}</h4>
                            <pre><code>{file.content}</code></pre>
                        </div>
                    ))
                ) : (
                    <pre><code>{props.code}</code></pre>
                )}
            </div> : null}
           
        </div>

    )
}