import { Link } from "react-router"
import { useTasks } from "../context/ProjectContext"
import { useEffect } from "react"
export default function ErrorPage() {
    const {setError} = useTasks()
    useEffect(()=>{
        setError(null)
    },[])
    return(
        <div className="errorPage">
        <p>404 page not found</p>
        <Link to='/'>Return Home</Link>
        </div>)
}