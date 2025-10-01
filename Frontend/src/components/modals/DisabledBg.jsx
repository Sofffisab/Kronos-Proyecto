import "./modals.css";

export default function DisabledBg(props) {
  return (
    <div onClick={props.onClick} className="bg">
      <div className="triggerDisabledBox" onClick={(e) => e.stopPropagation()}>
        {props.modal}
      </div>
    </div>
  );
}
