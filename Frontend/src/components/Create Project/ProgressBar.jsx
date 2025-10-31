import style from './create.module.css'

export default function ProgressBar(props) {

    return(

        <div className={style.bar}>
            <div className={style.innerBar} style={props.style}/>
        </div>

    )
}