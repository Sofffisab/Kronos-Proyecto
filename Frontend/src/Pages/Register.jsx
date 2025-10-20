import FancyTitle from "../components/FancyTitle";
import RegisterForm from "../components/RegisterForm";
import NavBar from '../components/NavBar'
export default function Register() {

return(
    <>
    <NavBar />
<div className='loginPage'>
    <FancyTitle class='loginTitle'text='Regístrate en KRONOS' subTitle='Da comienzo a esta experiencia'/>
<RegisterForm class='register' />
</div>
</>)
}