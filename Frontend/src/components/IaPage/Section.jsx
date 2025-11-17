import Separator from "../Separator";
import style from './ia.module.css'
import {useState, useRef} from 'react'
export default function Section(props) {

    const [imagePreview, setImagePreview] = useState(null)
    
    const fileRef = useRef(null)
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
    
        props.setImage(file);
    
        const reader = new FileReader();
        reader.onloadend = () => setImagePreview(reader.result);
        reader.readAsDataURL(file);
      };

      const deleteImage = () => {
          props.setImage(null)
          setImagePreview(null)
          if (fileRef.current) {
            fileRef.current.value = "";
          }
      }

    return(
        <div className={style.section}>
            <Separator/>
            <p>{props.title}</p>
            <Separator/>
           {props.file? <input ref={fileRef} onChange={handleImageChange} placeholder={props.placeholder} type='file' accept='image/*'/> : <textarea value={props.value} onChange={(e)=>props.onChange(e.target.value)}placeholder={props.placeholder}/>}
           {props.file && imagePreview && <div className={style.imageBox}><span onClick={deleteImage}className='material-symbols-outlined'>close</span><img src={imagePreview}/></div>}
        </div>
    )
}