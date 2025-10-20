import FancyTitle from "../components/FancyTitle";
import SplitForm from "../components/loginForm";
import NavBar from '../components/NavBar';
import {login} from '../../api/auth'
export default function Login() {
const fields= [{name: 'username',
requireMsg: 'Mail incorrecto o inexistente. Intenta de nuevo o cliquea aqui para ',
label: 'Dirección de email'},
{name: 'password',
requireMsg: 'Contraseña incorrecta o inexistente. Intenta de nuevo o cliquea aqui para ',
isPassword: true,
label:'Contraseña',
underText: '¿Te olvidaste tu contraseña?',
underTextLink: '/recover',
minLength: 7,
minLengthMsg: "la contraseña debe contar con 7 caracteres como minimo"},
]
return(
    <>
    <NavBar/>
<div className='loginPage'>
    <FancyTitle class='loginTitle'text='Bienvenido a KRONOS' subTitle='Para comenzar, iniciar sesion'/>
    
<SplitForm fields={fields} onSubmit={login} class='login' submitBtn='Inicia Sesion'/>
</div>
</>)
}