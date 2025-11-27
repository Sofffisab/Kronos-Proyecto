import DisabledBg from './DisabledBg'
import BaseModal from './BaseModal'
import style from './modals.module.css'

export default function SendIaModal(props) {

    return(
        <DisabledBg onClick={props.disableBg}
        modal={
            <BaseModal nowrap={true}
            title='¿Seguro que queres subir estos datos?'
            inputs={
                <p className={style.IaSubText}>Esta acción no podrá ser deshecha</p>
            }
            buttonTxt='Subir' 
            submit={props.submit}/>
        }/>
    )
}