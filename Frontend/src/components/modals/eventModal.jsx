import BaseModal from "./BaseModal";
import DisabledBg from "./DisabledBg";

export default function EventModal(props) {

    return(
        <DisabledBg onClick={props.disable} modal={
            <BaseModal title='evento' buttonTxt='cerrar' submit={props.disable} inputs={
                <div>
                    <label>Titulo:</label>
                <p>{props.title}</p>
                <label>Description:</label>
                <p>{props.desc}</p>
                <label>Date:</label>
                <p>{props.date}</p>
                </div>
            }/>
        }/>

    )
}