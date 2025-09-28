import {useForm} from 'react-hook-form'
import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Link } from 'react-router';
export default function(props) {
    const formFields = props.fields;
    const navigate = useNavigate()
    const [step, setStep] = useState(0)
    const [email, setEmail] =useState();
    const {
        register,
        handleSubmit,
        setValue,
        formState: { errors },
        reset,
        setError
      } = useForm();
      const resetAll = ()=> { 
        reset();
        setStep(0);
        setEmail(null);
      }
      const onSubmit = async (data) => {
          if(step<formFields.length -1)
          { formFields[step].name=='username' && setEmail(data.username)
            setStep(step+1); setValue(formFields[step+1].name, '') 
           }
          else {
        console.log(data);
        try {
       const bege = await props.onSubmit(data.username, data.password)
       console.log(bege)
          localStorage.setItem(bege.token); // hacer dsp con cookies 🍪🍪
         navigate('/')}
         catch(e) {
           setError("password",{type: "500", message:e.message})
         }
    }
    }
        const currentField = formFields[step]
        const [passwordVisibility, setPasswordVisibility] = useState(false)
        
return(
<>
<form onSubmit={handleSubmit(onSubmit)} className={props.class}>
  {email && <div className='gmailIngresado'>
  <span id="userNameIco" className="material-symbols-outlined">account_circle</span>
        <p>{email}</p>
        
        <span onClick={resetAll} style={{cursor: "pointer"}}className="material-symbols-outlined">cancel</span>
        
        </div>}
        <label style={errors[currentField.name] && {color: "#B20000"}}>{currentField.label}</label>
        <div className='inputBox'>
        <input className={errors[currentField.name] && "errorInput"}
        type={currentField.isPassword && !passwordVisibility && 'password'} {...register(currentField.name, {required: currentField.requireMsg,minLength: {value: currentField.minLength, message: currentField.minLengthMsg}})}
        placeholder={currentField.placeholder}/>
        
         {currentField.isPassword && <span style={{cursor: 'pointer'}}className="material-symbols-outlined" onClick={ () => setPasswordVisibility(!passwordVisibility)}>
{passwordVisibility? 'visibility' : 'visibility_off'}
</span> }
</div>

        <Link to={currentField.underTextLink}>{currentField.underText}</Link>
       

      <button type='submit'> {step < formFields.length - 1 ? 'Continuar' : props.submitBtn}</button>
      
     
      </form>
      {errors[currentField.name] && (
               <p className="formError">{errors[currentField.name].message}{errors[currentField.name].type== "minLength"? null : <Link style={{color: "#4240BE", textDecoration: "underline", }} to="/register">  Registrarse</Link>}</p>
             )}
     
    </>

)


}