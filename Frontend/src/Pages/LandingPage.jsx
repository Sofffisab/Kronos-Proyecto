import FancyTitle from "../components/FancyTitle"

import OldNavbar from "../components/OldNavBar.jsx"
import SimpleButton from "../components/SimpleButton"
import Footer from "../components/Footer"
import LoadingScreen from "../components/LoadingScreen"
import { useEffect, useState } from "react"


export default function LandingPage() {
 


  const [loading, setloading] = useState(false);
   useEffect(() => { 
     setloading(true);
    setTimeout(()=> {
      setloading(false)},
      500) })

  return (
    <>
 { loading && <LoadingScreen/> }
    <OldNavbar 
     button1Link='/login' button1Text='Iniciar sesion' button2Link='/register' button2Text='Comenzar'
    titleLink='/' 
    />
    <div className='LandingPage'>
<FancyTitle text='El tiempo es tuyo' subTitle='Nunca fue tan fácil trabajar en equipo' class='LandingTitle'/>
<SimpleButton text='Empezar' class='EmpezarBtn' link='/register'/>
<FancyTitle text='Todo lo que tu equipo necesita' class='LandingTitle'/>
<div className="landingImages">
  <img src='./public/LandingImg1.svg'/>
  <img src='./public/LandingImg2.svg'/>
</div>
</div>
<Footer/>
    </>
  )
      
}


