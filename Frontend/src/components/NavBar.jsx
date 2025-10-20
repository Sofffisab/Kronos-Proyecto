import {Link} from 'react-router'
import '../styles.css'
export default function Navbar(props) {

return(

<div className={props.class? props.class :'navBar'}>
    
    <Link to='/'><p>Kronos</p></Link>
</div>

)

}