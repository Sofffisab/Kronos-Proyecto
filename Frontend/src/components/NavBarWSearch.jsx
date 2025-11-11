import {useState} from 'react'
import { useTasks } from '../context/ProjectContext';
import AccountModal from './modals/AccountModal';
import SearchBar from "./SearchBar";

export default function NavBarWSearch(props) {
const {user} = useTasks()

const [modal, setModal] = useState(false)
return(
    <>
    {modal && <AccountModal name={user.nombre} mail={user.mail} disableBg={()=>setModal(false)}/>}
    <div className="NavSearch">
        <div id='leftIcons'>
        <span onClick={props.menuFunc} className='material-symbols-outlined'>menu</span>
        <p>Kronos</p>
        </div>
        <SearchBar/>
        <div id='rightIcons'>
        <img id='rightIcon1' src='../../public/questionIcon.svg'/>
        <img onClick={()=>setModal(true)} id='rightIcon2' src='../../public/UserDropDown.svg'/>,
        </div>

    </div>
    </>
)

} 