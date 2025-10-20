import FancyTitle from "../components/FancyTitle"
import ImageGallery from "../components/ImageGallery"
import OldNavbar from "../components/OldNavBar.jsx"
import SimpleButton from "../components/SimpleButton"
import Footer from "../components/Footer"
import LoadingScreen from "../components/LoadingScreen"
import { useEffect, useState } from "react"


export default function LandingPage() {
 

const images= [{src:'../../public/coconut.jpg', row: 20, id: 1},
{src:'../../public/coconut.jpg', row: 20, id: 2},
{src:'../../public/coconut.jpg', row: 30, id: 3},
{src:'../../public/coconut.jpg', row: 40, id: 4},
{src:'../../public/coconut.jpg', row: 30, id: 5},
{src:'../../public/coconut.jpg', row: 30, id: 6},
{src:'../../public/coconut.jpg', row: 20, id: 7},
{src:'../../public/coconut.jpg', row: 10, id: 8},
{src:"../../public/mirkin.jpg", row: 10, id: 9}]
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
<FancyTitle text='EL TIEMPO ES TUYO' subTitle='Nunca fue tan fácil trabajar en equipo' class='LandingTitle'/>
<SimpleButton text='Empezar' class='EmpezarBtn' link='/register'/>
<FancyTitle text='TODO LO QUE TU EQUIPO NECESITA' class='LandingTitle'/>
<ImageGallery images={images}/>
</div>
<Footer/>
    </>
  )
      
}


