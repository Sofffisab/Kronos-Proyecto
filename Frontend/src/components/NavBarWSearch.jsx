import { Navigate, useNavigate } from "react-router";
import LogoWText from "./LogoWText";
import SearchBar from "./SearchBar";

export default function NavBarWSearch(props) {

    const navigate = useNavigate()

return(
    <div className="NavSearch">
        <div id='leftIcons'>
        <span onClick={props.menuFunc} className='material-symbols-outlined'>menu</span>
        <p>Kronos</p>
        </div>
        <SearchBar/>
        <div id='rightIcons'>
        <img id='rightIcon1' src='../../public/questionIcon.svg'/>
        <img id='rightIcon2' src='../../public/UserDropDown.svg'/>
        </div>

    </div>
)

} 