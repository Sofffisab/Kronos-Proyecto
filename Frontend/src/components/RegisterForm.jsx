import { useForm } from "react-hook-form";
import { useState } from "react";
import { Link, UNSAFE_NavigationContext } from "react-router";
import { useNavigate } from "react-router";
export default function RegisterForm(props) {

  const navigate = useNavigate()

    const {
        register,
        handleSubmit,
        setValue,
        setError,
        formState: { errors },
        reset,
      } = useForm();

      const [step, setStep] = useState(1);
      const [email, setEmail] =useState();
      const resetAll = ()=> { 
        reset();
        setStep(1);
        setEmail(null);}
      const onSubmit = async (data) => {
        if(step==1)
        {setStep(2); 
         setEmail(data.email)}
        else {
          console.log(data);
          try{
      
      const result = props.onSubmit && await props.onSubmit(data.nombre, data.email, data.password, data.pfp)
      console.log(result)
      localStorage.setItem("token",result.token); // hacer dsp con cookies 🍪🍪
       navigate('/')}
      catch(e){
        setError("password",{type: "500", message:e.message})

      }}} 


      
      const [passwordVisibility, setPasswordVisibility] = useState(false)
return(

<>
{email && <div className='gmailIngresado'>
  <span id="userNameIco" className="material-symbols-outlined">account_circle</span>
        <p>Te registraste como {email}</p>
        
        <span onClick={resetAll} style={{cursor: "pointer"}}className="material-symbols-outlined">cancel</span>
        
        </div>}
<form onSubmit={handleSubmit(onSubmit)} className={props.class}>

       {step==1 &&  ( <div className='inputBox'>
        <input id='firstInputRegister' 
         {...register('email', {required:'inserte un email'})}
        placeholder='nombre@empresa.com'/> 
         <button type='submit'style={step==1 ?{borderTopLeftRadius: '0px', borderBottomLeftRadius: '0px'} : null}> {step==1 ? 'Continuar' : 'Registrate'}</button>
</div>)}


{step==2 &&  ( <div className='input2Box'>
  <div className='biggerRegisterContainer'>
        <div className="imgInput">
          <img id='imgRegister' src="public/userPicInsert.svg"/>
        <input id='registerImg' type='file' accept='image/*'
        {...register('pfp', {required: 'inserte una imagen'})}/>
        </div>
        <div className='smallerRegisterContainer'>
        <label>Tu nombre completo</label>
        <input 
         {...register('nombre', {required: 'Inserte un nombre'})}
      /> 
      <label>Contraseña</label>
        <input type={passwordVisibility ? null : 'password'} 
         {...register('password', {required: 'Inserte una constraseña',minLength: {value: 7, message: "La contraseña debe tener un minimo de 7 caracteres"}})}
      /> 
      <span style={{cursor: 'pointer'}}className="material-symbols-outlined" onClick={ () => setPasswordVisibility(!passwordVisibility)}>
{passwordVisibility? 'visibility' : 'visibility_off'}
</span> 
</div>
</div>
<Link to='/login'>Inicia sesión acá</Link>
<button type='submit'style={step==1 ?{borderTopLeftRadius: '0px', borderBottomLeftRadius: '0px'} : null}> {step==1 ? 'Continuar' : 'Registrate'}</button>
</div>)}
        
       

     
      
     
      </form>
      {Object.values(errors)[0] && (
  <p className="formError">{Object.values(errors)[0].message}</p>
)}
    </>


)

        }
