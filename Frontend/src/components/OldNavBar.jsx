import {Link} from 'react-router'
import '../styles.css'
import LogoWText from './LogoWText'
export default function OldNavbar(props) {

return(

<div className={props.class? props.class :'NavBar'}>
    <div className="NavBarLeftDiv">
   <LogoWText titleLink={props.titleLink} logoOnClick={props.logoOnClick}/>
    </div>
    <div className="NavBarRightDiv">
<Link to={props.button1Link}>
    <button className='NavButton1'>{props.button1Text}</button>
    </Link>
    <Link to={props.button2Link}>
    <button className='NavButton2'>{props.button2Text}</button>
    </Link>
    </div>
</div>

)

}