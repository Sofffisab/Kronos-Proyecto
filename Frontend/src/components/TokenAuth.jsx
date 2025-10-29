import { verifyToken } from "../../api/auth"
import { useNavigate } from "react-router"
import { Children } from "react"
export default function TokenAuth() {
    const nav = useNavigate
    const token = localStorage.getItem('token')
    const tokenVerify = verifyToken(token)

    if(!token || !tokenVerify) return Children
    else nav('/project')
}