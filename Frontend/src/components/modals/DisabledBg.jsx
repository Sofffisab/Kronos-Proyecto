import "./modals.css";

export default function DisabledBg(props) {
  return (
    <div onClick={props.onClick} className="bg">
      
        {props.modal }
      
    </div>
  );
}
