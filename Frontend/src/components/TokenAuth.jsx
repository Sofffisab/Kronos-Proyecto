import { verifyToken } from "../../api/auth"
import { useNavigate } from "react-router"
import { useState } from "react"
import { useEffect } from "react"
import LoadingScreen from "./LoadingScreen"
export default function TokenAuth({children}) {

    const [valid, setValid]= useState()
    const nav = useNavigate()

    useEffect(()=>{
        const token = localStorage.getItem('token')
        if(!token) {setValid(false)
             return;
}
        const check = async ()=>{
            const verify = await verifyToken(token)
            setValid(verify)

        }
        check()
    

    }, [])

    if(valid === null) return(<LoadingScreen/>)


    if(!valid) return children

   nav('/project')
   return null
}