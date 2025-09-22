
import { useState } from "react";
import './PgContent.css';
import List from "./List/List.jsx";
import SelectBar from "./SelectBar";
export default function ProjectPageContent(props) {

const [selected, setSelected] = useState(1) 


return (<div className='PgContent' style={props.SbOpen?{marginLeft: '0px', width: '100%'} : {}}>
<SelectBar setSelected={setSelected} selected={selected} SbOpen={props.SbOpen}/>
<List/>

</div>
)

}