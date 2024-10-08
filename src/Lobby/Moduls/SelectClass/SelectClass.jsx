import React from 'react';
import './SelectClass.css';
import ProgressBar from 'react-bootstrap/ProgressBar';
import { MdSkipNext } from "react-icons/md";
import { IoMdSend } from "react-icons/io";
import { IoLinkSharp } from "react-icons/io5";
import Flores from '../../../assets/images/circleVioleta.png';
import Swal from 'sweetalert2';
import Preloader from '../../../Components/Shared/Preloader/Preloader';
import ReactPlayer from 'react-player'
import Offcanvas from 'react-bootstrap/Offcanvas';
import { IoIosClose } from "react-icons/io";
import { NavLink, useNavigate } from 'react-router-dom';
import { AppContext } from '../../../Context';
import { set } from 'date-fns';
import { CreateComment, GetComments } from '../../../Services/Comments/Comments';
import { GetUser } from '../../../Services/Users/Users';
import { getUserModulActivities, updateActivities } from '../../../Services/Moduls/Moduls';

export default function SelectClass() {

    const navigate=useNavigate();
    // React.useContext
    let {userModulActivitiesLink,setUserModulActivitiesLink,userModulActivities,setUserModulActivities,selectActivityType,setSelectActivityType,userData,setUserData,roles,setRoles,moduls,setModuls,institution,setInstitution,selectModul,setSelectModul,selectActivityIndex,setSelectActivityIndex,selectActivity,setSelectActivity} =  React.useContext(AppContext);
    /* use state */
    let [state,setState] = React.useState(1);

    let [comments,setComment] = React.useState([]);
    let [preloader,setPreloader] = React.useState(false);
    let [users,setUsers] = React.useState([]);

    // use State
    const [show2, setShow2] = React.useState(false);
    const handleClose2 = () => setShow2(false);
    const handleShow2 = () => setShow2(true);
    /* useEffect */

    React.useEffect(()=>{
        
        loadUsers();

    },[])

    let loadUsers=async()=>{

        // obtenemos los usuarios
        let result =  undefined;
        setPreloader(true);
        result =  await GetUser().catch((error)=>{
          console.log(error);
          setPreloader(false);
          Swal.fire({
            icon: 'info',
            title: 'Problemas al cargar usuarios'
          })
        });
  
        if(result){
          setPreloader(false);
          setUsers(result.data);
          GetComentarios();
        }
  
      }
    
    const GetComentarios=async()=>{
        let result =  undefined;
        result =  await GetComments().catch((error)=>{
            console.log(error);
            setPreloader(false);
            Swal.fire({
                icon: 'info',
                title: 'Error al traer comentarios'
            })
        })
        if(result){
            console.log("comentarios: ",result.data);
            setComment(result.data);
        }

    }

    const GetUserData=(userId)=>{
        let filter_ =  users.filter((obj)=> obj?.id == userId);
        if(filter_.length == 0){
            return null;
        }else{
            return filter_[0]
        }
    }


    const convertDate=(fechaISO)=>{
        // Convertir la cadena a un objeto Date
        const fecha = new Date(fechaISO);

                // Crear un array con los nombres de los meses
                const meses = [
                "enero", "febrero", "marzo", "abril", "mayo", "junio",
                "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"
                ];

                // Obtener el día, el mes y el año de la fecha
                const dia = fecha.getUTCDate();
                const mes = meses[fecha.getUTCMonth()]; // getUTCMonth() devuelve el mes (0-11)
                const año = fecha.getUTCFullYear();

                // Formatear la fecha en el formato deseado
                const fechaFormateada = `Publicado el ${dia} de ${mes} de ${año}`;

                return fechaFormateada

        }

        let [inputComment,setInputComment] = React.useState("");

        let ReadInput=(event)=>{
            setInputComment(event.target.value);
        }

        const generateComment=async()=>{
            if(inputComment == ""){

                Swal.fire({
                    icon: 'info',
                    title: 'Debes ingresar algun comentario para publicar'
                })

            }else{

                let result =  undefined;
                
                result =  await  CreateComment({'content':inputComment,'user':userData?.id}).catch((error)=>{
                    console.log(error);
                    setPreloader(false);
                    Swal.fire({
                        icon: 'info',
                        title: 'Error al crear comentario'
                    })
                })
                if(result){
                    setPreloader(false);
                    setInputComment("");
                    GetComentarios();
                }

            }
        }


        function jsonToFormData(obj, formData = new FormData(), parentKey = '') {
            if (Array.isArray(obj)) {
                // Si es una lista, iteramos sobre los elementos
                obj.forEach((value, index) => {
                    const key = parentKey ? `${parentKey}[${index}]` : index;
                    jsonToFormData(value, formData, key);
                });
            } else if (typeof obj === 'object' && obj !== null && !(obj instanceof File)) {
                // Si es un objeto, iteramos sobre sus propiedades
                for (let key in obj) {
                    if (obj.hasOwnProperty(key)) {
                        const propName = parentKey ? `${parentKey}[${key}]` : key;
                        jsonToFormData(obj[key], formData, propName);
                    }
                }
            } else {
                // Si es un valor simple (no objeto, no array), lo añadimos directamente
                formData.append(parentKey, obj);
            }
            return formData;
        }

        // EVIDENCE
        const ReadFileData=async(event,key,field)=>{

            let ModulActivities = {...userModulActivities};
            // GUARDAMOS Y ACTUALIZAMOS LAS ACTIVIDADES
            let jsonTo = ModulActivities['activity_module_editable'];
            let formData = new FormData();
            formData.append('tipo',selectActivityType);
            formData.append('key',key);
            formData.append('id',ModulActivities['activity_module_editable'][selectActivityType][selectActivityIndex][key]['id'])
            formData.append('campo',field);
            formData.append('valor_campo',event.target.files[0])

            // LLAMAMOS EL SERVICIO DE UPDATE
            let result =  undefined;
            setPreloader(true);
            result =  await updateActivities(ModulActivities['activity_module_editable']['url'],formData).catch((error)=>{
                console.log(error);
                setPreloader(false);
                Swal.fire({
                    icon: 'info',
                    title: 'Error al subir el documento'
                })
            })
            if(result){
                console.log("DATOS AL ACTUALIZAR ACTIVIDAD: ",result.data);
                // obtener el conjunto de actividades
                let answer =  undefined;
                answer =  await getUserModulActivities(userModulActivitiesLink).catch((error)=>{
                    console.log(error);
                    setPreloader(true);
                    Swal.fire({
                        icon: 'info',
                        title: 'Problemas para cargar datos',
                    })
                })
                if(answer){
                    Swal.fire({
                        icon: 'success',
                        title: 'Archivo cargado con éxito',
                        text:'continua con la siguiente actividad'
                    })
                    setUserModulActivities(answer.data);
                    setPreloader(false);
                    // actualizamos la clase actual
                    console.log("RESPUESTAS: ",answer.data,selectActivityType,selectActivityIndex)
                    setSelectActivity(answer.data['activity_module_editable'][selectActivityType][selectActivityIndex])
                }
                
            }
            
        }
        
        

        const NextActivity=()=>{
            // VERIFICAMOS EL ORDEN Y EL TIPO DE ACTIVIDAD
            // obtenemos el tipo de actividad en el que se encuentra
            let lista_actividades = userModulActivities?.activity_module_editable[selectActivityType];
            if(lista_actividades.length == selectActivityIndex+1){
                // si estamos en la ultima actividad de la categoria  necesitamos cambiar a la siguiente categoria que tenga elementos y si no hay mas pasamos a la presentación del éxamen
                if(selectActivityType == 'foundations'){

                    // calculamos la longitud de cada actividad
                    let long_engage = userModulActivities?.activity_module_editable?.engage.length;
                    let long_co_create = userModulActivities?.activity_module_editable?.co_create.length;
                    let long_reflection = userModulActivities?.activity_module_editable?.reflection.length;

                    if(long_engage !== 0){
                        let obj = userModulActivities?.activity_module_editable?.engage[0]
                        setSelectActivityIndex(0);
                        setSelectActivityType('engage');
                        setSelectActivity(obj);

                    }else if(long_co_create !== 0){

                        let obj = userModulActivities?.activity_module_editable?.co_create[0]
                        setSelectActivityIndex(0);
                        setSelectActivityType('co_create');
                        setSelectActivity(obj);

                    }else if(long_reflection !== 0){

                        let obj = userModulActivities?.activity_module_editable?.reflection[0]
                        setSelectActivityIndex(0);
                        setSelectActivityType('reflection');
                        setSelectActivity(obj);

                    }else{
                        // pasamos al éxamen
                        handleShow2();
                    }


                }else if(selectActivityType == 'engage'){

                    let long_co_create = userModulActivities?.activity_module_editable?.co_create.length;
                    let long_reflection = userModulActivities?.activity_module_editable?.reflection.length;
                    if(long_co_create !== 0){

                        let obj = userModulActivities?.activity_module_editable?.co_create[0]
                        setSelectActivityIndex(0);
                        setSelectActivityType('co_create');
                        setSelectActivity(obj);

                    }else if(long_reflection !== 0){

                        let obj = userModulActivities?.activity_module_editable?.reflection[0]
                        setSelectActivityIndex(0);
                        setSelectActivityType('reflection');
                        setSelectActivity(obj);

                    }else{
                        // pasamos al éxamen
                        handleShow2();
                    }

                }else if(selectActivityType == 'co_create'){

                    let long_reflection = userModulActivities?.activity_module_editable?.reflection.length;
                    
                    if(long_reflection !== 0){

                        let obj = userModulActivities?.activity_module_editable?.reflection[0]
                        setSelectActivityIndex(0);
                        setSelectActivityType('reflection');
                        setSelectActivity(obj);

                    }else{
                        // pasamos al éxamen
                        handleShow2();
                    }

                }else{

                    // pasariamos a presentar el éxamen
                    handleShow2();
                }
            }else{
                // si no estamos en la ultima pasamos a la siguiente y listo
                let index = selectActivityIndex+1
                setSelectActivityIndex(index);
                setSelectActivity(lista_actividades[index]);
            }

        }

        const ReadCheckBox=(event,value,type,index)=>{

            // obtenemos el elementos y actualizamos
            let copyActivityModuls = {...userModulActivities};
            
            copyActivityModuls['survey_module_editable']['survey'][index][type]['level_of_satisfaction']= value;
            console.log("GUARDADO: ",copyActivityModuls);
            setUserModulActivities(copyActivityModuls);

        }

        const ReadTextArea=(event,index)=>{
            let copyActivityModuls = {...userModulActivities};
            
            copyActivityModuls['survey_module_editable']['survey'][index]['open_questionary_optional']['response']= event.target.value;
            console.log("GUARDADO: ",copyActivityModuls);
            setUserModulActivities(copyActivityModuls);
        }

        const RegisterSurvey=async()=>{
            console.log("DATOS FINALES: ",userModulActivities);
            let result =  undefined;
            setPreloader(true);
            
            result =  await updateActivities(userModulActivities?.survey_module_editable?.url,userModulActivities?.survey_module_editable).catch((error)=>{
                console.log(error);
                setPreloader(false);
                Swal.fire({
                    icon: 'info',
                    title: 'Error al subir el documento'
                })
            })
            if(result){
                console.log("DATOS AL ACTUALIZAR ACTIVIDAD: ",result.data);
                setPreloader(false);
                Swal.fire({
                    icon: 'success',
                    title: 'Felicidades haz terminado el módulo'
                }).then((r)=>{
                    if(r.isConfirmed){
                        navigate('/Lobby')
                    }else{
                        navigate('/Lobby')
                    }
                })

            }
        }


    return (
        <>

        <div className='dataModulContainer'>
            {
                    preloader ?
                    <>
                    <Preloader></Preloader>
                    </>
                    :

                    <></>
            }
            <div className='navBarClass'>
                    <span className='fontSemiBold color-purple' style={{'fontSize':'20px','marginRight':'10px'}}>{selectModul?.title}</span>
                    {/* <div className='progressContainer'>
                        <ProgressBar variant="info"  label={`${'60'}%`} now={60} />
                    </div> */}
                    {/* <div className='classNumber bs-2-'>
                        <span className='fontLight'>{selectActivityIndex+1}</span>
                    </div> */}
                    <div onClick={NextActivity} className='classNumber bs-2-'>
                        <MdSkipNext className='fontLight'></MdSkipNext>
                    </div>
                    
            </div>
            <div className='CourseContainer '>
                    <div className='activityCourseContainer bs-2-'>
                            <div className='activityV2'>
                                {/*dependiendo de la actividad colocamos*/}
                            {selectActivity?.hasOwnProperty("video") ?   
                            <ReactPlayer width={'100%'} height={'100%'} url={selectActivity?.video?.video_link} /> 
                            : 
                            <></>
                            }
                            {selectActivity?.hasOwnProperty("format_text") ?  
                            <div className='format_textActivity'>
                                    <span style={{'fontSize':'20px'}} className='fontSemiBold'>{'Instrucciones'}</span>
                                    <p style={{'textAlign':'center','fontSize':'20px'}} className='fontLight' dangerouslySetInnerHTML={{ __html: selectActivity?.format_text?.text.replace(/\r\n/g, '<br>').replace(/\n/g, '<br>').replace(/\r/g, '') }}/>
                            </div>  
                            :
                            <></>
                            }
                            {selectActivity?.hasOwnProperty("evidence") ?   
                            <div className='format_textActivity'>
                                    <span style={{'fontSize':'20px'}} className='fontSemiBold'>{'Instrucciones'}</span>
                                    <p style={{'textAlign':'center','fontSize':'20px'}} className='fontLight' dangerouslySetInnerHTML={{ __html: selectActivity?.evidence?.description.replace(/\r\n/g, '<br>').replace(/\n/g, '<br>').replace(/\r/g, '') }}/>
                                    <div class="custom-input-file col-md-6 col-sm-6 col-xs-6">
                                            <input onChange={(event)=>ReadFileData(event,'evidence','upload')}  type="file" id="fichero-tarifas" class="input-file" value=""></input>
                                            <span className='fontSemiBold'>Subir archivo</span>
                                    </div>
                                    {selectActivity['evidence']['upload'] !== null ? 
                                    <span className='fontSemiBold linked' onClick={()=>window.open(selectActivity['evidence']['upload'])}>Ver archivo</span>
                                    :
                                    <></>
                                    }
                                    
                            </div>
                            :
                            <>
                            </>
                            }
                            {selectActivity?.hasOwnProperty("redaction") ?   
                            <div className='format_textActivity'>
                                    <span style={{'fontSize':'20px'}} className='fontSemiBold'>{'Instrucciones'}</span>
                                    <p style={{'textAlign':'center','fontSize':'20px'}} className='fontLight' dangerouslySetInnerHTML={{ __html: selectActivity?.redaction?.description.replace(/\r\n/g, '<br>').replace(/\n/g, '<br>').replace(/\r/g, '') }}/>
                                    <span className='fontSemiBold color-purple'>Contenido</span>
                                    <div style={{'height':'300px'}} className='col-12 col-sm-12 col-md-12 col-lg-12 col-xl-12 col-xxl-12 mb-3 mb-sm-3 mb-md-4 mb-lg-4 mb-xl-4 mb-xxl-4'>
                                        <textarea  style={{'height':'300px'}} className='form-control fontLight heightImportant' rows="4" placeholder='Ingrese el comentario deseado'></textarea>
                                    </div>
                                    <div  className='Button_2'>
                                                    <span className='text_button_2'>Guardar</span>
                                    </div>

                            </div>
                            :
                            <></>
                            }
                            </div>
                            {selectActivity?.hasOwnProperty("video") ?   <span className='fontSemiBold' style={{'paddingLeft':'10px'}}>{'Actividad '+(parseInt(selectActivityIndex)+1)+' Video orquídeas'}</span> : <></>}
                            {selectActivity?.hasOwnProperty("format_text") ?   <span className='fontSemiBold' style={{'paddingLeft':'10px'}}>{'Actividad '+(parseInt(selectActivityIndex)+1)+' Momento de discusión'}</span> : <></>}
                            {selectActivity?.hasOwnProperty("evidence") ?   <span className='fontSemiBold' style={{'paddingLeft':'10px'}}>{'Actividad '+(parseInt(selectActivityIndex)+1)+' Adjunta tu respuesta'}</span> : <></>}
                            {selectActivity?.hasOwnProperty("redaction") ?   <span className='fontSemiBold' style={{'paddingLeft':'10px'}}>{'Actividad '+(parseInt(selectActivityIndex)+1)+' Corta redacción'}</span> : <></>}
                            <span className='fontLight' style={{'paddingLeft':'10px'}}>{convertDate(selectModul?.created_at)}</span>
                            {/*Definimos las opciones*/}
                            <div className='card-header border-0 rounded-3'>
                                <div className='row'>
                                    <div className='col-12'>
                                    <ul className='nav nav-pills d-flex flex-row justify-content-between' role="tablist">
                                        <li className='nav-item' role="presentation">
                                        <button onClick={()=>setState(1)} className='nav-link active rounded-0 d-flex flex-row justify-content-center align-items-center align-self-center' id="product-tab1" data-bs-toggle="pill" data-bs-target="#pills-product1" type="button" role="tab" aria-controls="pills-product1" aria-selected="true"> <span className='fontLight me-2'>Contexto</span></button>
                                        </li>
                                        {/* <li className='nav-item' role="presentation">
                                        <button onClick={()=>setState(2)} className='nav-link rounded-0 d-flex flex-row justify-content-center align-items-center align-self-center' id="product-tab2" data-bs-toggle="pill" data-bs-target="#pills-product2" type="button" role="tab" aria-controls="pills-product2" aria-selected="true"> <span className='fontLight me-2'>Recursos</span></button>
                                        </li> */}
                                        <li className='nav-item' role="presentation">
                                        <button onClick={()=>setState(3)} className='nav-link  rounded-0 d-flex flex-row justify-content-center align-items-center align-self-center' id="product-tab3" data-bs-toggle="pill" data-bs-target="#pills-product3" type="button" role="tab" aria-controls="pills-product3" aria-selected="false"> <span className='fontLight me-2'>Temario</span></button>
                                        </li>
                                    </ul>
                                    </div>
                                </div>
                            </div>
                            {/* DEFINIMOS LAS AREAS A UTILIZAR */}
                            {state == 1 ? 
                                <div className='tab-pane fade show' id='pills-product2' role="tabpanel" aria-labelledby="product-tab" tabIndex="0">
                                <div className='row'>
                                    <div className='col-12'>
                                        <div className='d-grid gap-2 pt-1' style={{'padding':'10px'}}>
                                            <p className='fontSemiBold'>¿Qué vamos a realizar?</p>
                                            {selectActivity?.hasOwnProperty("video") ?   <p className='fontLight' dangerouslySetInnerHTML={{ __html: selectActivity?.video?.description.replace(/\r\n/g, '<br>').replace(/\n/g, '<br>').replace(/\r/g, '') }}/> : <></>}
                                            {selectActivity?.hasOwnProperty("format_text") ?   <p className='fontLight' dangerouslySetInnerHTML={{ __html: 'Sigue las instrucciones del apartado superior' }}/> : <></>}
                                            {selectActivity?.hasOwnProperty("evidence") ?   <p className='fontLight' dangerouslySetInnerHTML={{ __html: selectActivity?.evidence?.description.replace(/\r\n/g, '<br>').replace(/\n/g, '<br>').replace(/\r/g, '') }}/> : <></>}
                                            {selectActivity?.hasOwnProperty("redaction") ?   <p className='fontLight' dangerouslySetInnerHTML={{ __html: selectActivity?.redaction?.description.replace(/\r\n/g, '<br>').replace(/\n/g, '<br>').replace(/\r/g, '') }}/> : <></>}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            :
                            <></>
                            }
                            {/* {state == 2 ? 
                            <div className='tab-pane fade show' id='pills-product2' role="tabpanel" aria-labelledby="product-tab" tabIndex="0">
                                <div className='row'>
                                    <div className='col-12'>
                                        <div className='d-grid gap-2 pt-1' style={{'padding':'10px'}}>
                                            <div className='linkContainer'>
                                                    <div className='iconContainer'>
                                                                <IoLinkSharp  size={25}/>
                                                    </div>
                                                    <span className='fontLight'>https://platzi.com/diseño</span>
                                            </div>
                                            <div className='linkContainer'>
                                                    <div className='iconContainer'>
                                                                <IoLinkSharp  size={25}/>
                                                    </div>
                                                    <span className='fontLight'>https://platzi.com/diseño</span>
                                            </div>
                                            <div className='linkContainer'>
                                                    <div className='iconContainer'>
                                                                <IoLinkSharp  size={25}/>
                                                    </div>
                                                    <span className='fontLight'>https://platzi.com/diseño</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            :
                            <></>
                            } */}
                            {state == 3 ? 
                            <div className='tab-pane fade show' id='pills-product3' role="tabpanel" aria-labelledby="product-tab" tabIndex="0">
                                <div className='row'>
                                    <div className='col-12'>
                                        <div className='d-grid gap-2 pt-1'>
                                        {userModulActivities?.activity_module_editable?.foundations.map((obj,index)=>{
                                            return(
                                                    <div key={index} onClick={()=>{
                                                            // Guardamos el indice de la actividad
                                                            setSelectActivityIndex(index);
                                                            setSelectActivityType('foundations');
                                                            // Guardamos la actividad especifica
                                                            setSelectActivity(obj);
                                                            setState(1);
                                                            }} className='divClass_3 bs-2-'>
                                                            <div className='TextContainerClass'>
                                                            {obj?.hasOwnProperty("video") ?   <span className='fontSemiBold' style={{'textAlign':'center'}}>{'Cimientos  video orquídeas'}</span> : <></>}
                                                                {obj?.hasOwnProperty("format_text") ?   <span className='fontSemiBold' style={{'textAlign':'center'}}>{'Cimientos momento de discusión'}</span> : <></>}
                                                                {obj?.hasOwnProperty("evidence") ?   <span className='fontSemiBold' style={{'textAlign':'center'}}>{'Cimientos adjunta tu respuesta'}</span> : <></>}
                                                                {obj?.hasOwnProperty("redaction") ?   <span className='fontSemiBold' style={{'textAlign':'center'}}>{'Cimientos corta redacción'}</span> : <></>}
                                                                    <span className='fontLight dateClass' style={{'textAlign':'center'}}>{convertDate(selectModul?.created_at)}</span>
                                                            </div>
                                                    </div>
                                            )
                                        })
                                        }
                                        {userModulActivities?.activity_module_editable?.engage.map((obj,index)=>{
                                            return(
                                                    <div key={index} onClick={()=>{
                                                            // Guardamos el indice de la actividad
                                                            setSelectActivityIndex(index);
                                                            setSelectActivityType('engage');
                                                            // Guardamos la actividad especifica
                                                            setSelectActivity(obj);
                                                            setState(1);
                                                            }} className='divClass_3 bs-2-'>
                                                            <div className='TextContainerClass'>
                                                                {obj?.hasOwnProperty("video") ?   <span className='fontSemiBold' style={{'textAlign':'center'}}>{'Compromiso Video orquídeas'}</span> : <></>}
                                                                {obj?.hasOwnProperty("format_text") ?   <span className='fontSemiBold' style={{'textAlign':'center'}}>{'Compromiso  momento de discusión'}</span> : <></>}
                                                                {obj?.hasOwnProperty("evidence") ?   <span className='fontSemiBold' style={{'textAlign':'center'}}>{'Compromiso adjunta tu respuesta'}</span> : <></>}
                                                                {obj?.hasOwnProperty("redaction") ?   <span className='fontSemiBold' style={{'textAlign':'center'}}>{'Compromiso corta redacción'}</span> : <></>}
                                                                    <span className='fontLight dateClass' style={{'textAlign':'center'}}>{convertDate(selectModul?.created_at)}</span>
                                                            </div>
                                                    </div>
                                            )
                                        })
                                        }
                                        {userModulActivities?.activity_module_editable?.co_create.map((obj,index)=>{
                                            return( 
                                                    <div key={index} onClick={()=>{
                                                            // Guardamos el indice de la actividad
                                                            setSelectActivityIndex(index);
                                                            setSelectActivityType('co_create');
                                                            // Guardamos la actividad especifica
                                                            setSelectActivity(obj);
                                                            setState(1);
                                                            }} className='divClass_3 bs-2-'>
                                                            <div className='TextContainerClass'>
                                                            {obj?.hasOwnProperty("video") ?   <span className='fontSemiBold' style={{'textAlign':'center'}}>{'Trabajo colaborativo video orquídeas'}</span> : <></>}
                                                                {obj?.hasOwnProperty("format_text") ?   <span className='fontSemiBold' style={{'textAlign':'center'}}>{'Trabajo colaborativo momento de discusión'}</span> : <></>}
                                                                {obj?.hasOwnProperty("evidence") ?   <span className='fontSemiBold' style={{'textAlign':'center'}}>{'Trabajo colaborativo adjunta tu respuesta'}</span> : <></>}
                                                                {obj?.hasOwnProperty("redaction") ?   <span className='fontSemiBold' style={{'textAlign':'center'}}>{'Trabajo colaborativo corta redacción'}</span> : <></>}
                                                                    <span className='fontLight dateClass' style={{'textAlign':'center'}}>{convertDate(selectModul?.created_at)}</span>
                                                            </div>
                                                    </div>
                                            )
                                        })
                                        }
                                        {userModulActivities?.activity_module_editable?.reflection.map((obj,index)=>{
                                            return(
                                                    <div key={index} onClick={()=>{
                                                            // Guardamos el indice de la actividad
                                                            setSelectActivityIndex(index);
                                                            setSelectActivityType('reflection');
                                                            // Guardamos la actividad especifica
                                                            setSelectActivity(obj);
                                                            setState(1);
                                                            }} className='divClass_3 bs-2-'>
                                                            <div className='TextContainerClass'>
                                                                {obj?.hasOwnProperty("video") ?   <span className='fontSemiBold' style={{'textAlign':'center'}}>{'Reflexión video orquídeas'}</span> : <></>}
                                                                {obj?.hasOwnProperty("format_text") ?   <span className='fontSemiBold' style={{'textAlign':'center'}}>{'Reflexión momento de discusión'}</span> : <></>}
                                                                {obj?.hasOwnProperty("evidence") ?   <span className='fontSemiBold' style={{'textAlign':'center'}}>{'Reflexión adjunta tu respuesta'}</span> : <></>}
                                                                {obj?.hasOwnProperty("redaction") ?   <span className='fontSemiBold' style={{'textAlign':'center'}}>{'Reflexión corta redacción'}</span> : <></>}
                                                                    <span className='fontLight dateClass' style={{'textAlign':'center'}}>{convertDate(selectModul?.created_at)}</span>
                                                            </div>
                                                    </div>
                                            )
                                        })
                                        }
                                        </div>
                                    </div>
                                </div>
                            </div>
                            :
                            <></>
                            }
                            
                    </div>
                    <div className='chatCourseContainer bs-2-'>
                        <span className='fontSemiBold color-purple'>Foro</span>
                        <div className='col-12 col-sm-12 col-md-12 col-lg-12 col-xl-12 col-xxl-12 mb-3 mb-sm-3 mb-md-4 mb-lg-4 mb-xl-4 mb-xxl-4'>
                            <textarea value={inputComment} onChange={ReadInput} className='form-control fontLight ' rows="4" placeholder='Ingrese el comentario deseado'></textarea>
                        </div>
                        <div onClick={generateComment} className='ButtonSend bs-2-'>
                                <IoMdSend></IoMdSend>
                        </div>
                        <div className='comentaryContainer'>
                            {comments.map((obj,index)=>{
                                return(
                                    <div key={index} className='Comentario bs-2-'>
                                    <span className='Name fontSemiBold color-purple' >{ GetUserData(obj?.user)?.last_name}</span>
                                    <p className='Comment fontLight'>{obj?.content}</p>
                                    </div>
                                )
                            })}
                            
                        </div>
                        
                    </div>
            </div>
        </div>
        {/* PRESENTAR EL ÉXAMEN */}
        <Offcanvas className="" show={show2} onHide={handleClose2}>
                <div className='offcanvas-header pb-4 padding-40-'>
                <h2 className='m-0 p-0 lh-sm fs-4-  fw-bold fontSemiBold color-purple'>Retroalimentación</h2>
                <IoIosClose style={{'cursor':'pointer'}} onClick={handleClose2} size={30} className='fa icon-close'></IoIosClose>
                </div>
                <div className='offcanvas-body '>
                <div className='container-fluid pt-0 pb-0 padding-40-'>
                    <div className='row'>
                    <div className='col-12'>
                    <form action='' className='Form'>
                            {userModulActivities?.survey_module_editable.survey.map((obj,index)=>{
                                return(

                                    <>
                                        {obj.hasOwnProperty('satisfaction_question') ? 
                                        <div key={index} className='row g-0 g-sm-0 g-md-2 g-lg-2 g-xl-2 g-xxl-2 mt-3'>
                                            <div className='col-12 d-flex flex-column flex-sm-column flex-md-column flex-lg-column flex-xl-column flex-xxl-column justify-content-between align-items-center align-self-center mb-2'>
                                                <p className='m-0 me-0 me-sm-3 me-md-3 me-lg-3 me-xl-3 me-xxl-3 mb-3 lh-sm text-center fs-5- fontLight- fw-normal tx-light-black-' dangerouslySetInnerHTML={{ __html: obj?.satisfaction_question?.survey.replace(/\r\n/g, '<br>').replace(/\n/g, '<br>').replace(/\r/g, '') }}/>
                                                <div className='d-flex flex-row justify-content-start justify-content-sm-start justify-content-md-start justify-content-lg-start justify-content-xl-start justify-content-xxl-start align-items-center align-self-center'>
                                                    <div className='checks-radios- me-1'>
                                                        <label>
                                                        <input onChange={(event)=>ReadCheckBox(event,1,'satisfaction_question',index)} type="radio" name={"radio"+index}/>
                                                        <span className='lh-sm fs-5- fontLight- tx-dark-purple-'>1</span>
                                                        </label>
                                                    </div>
                                                    <div className='checks-radios- me-1'>
                                                        <label>
                                                        <input onChange={(event)=>ReadCheckBox(event,2,'satisfaction_question',index)} type="radio" name={"radio"+index}/>
                                                        <span className='lh-sm fs-5- fontLight- tx-dark-purple-'>2</span>
                                                        </label>
                                                    </div>
                                                    <div className='checks-radios- me-1'>
                                                        <label>
                                                        <input onChange={(event)=>ReadCheckBox(event,3,'satisfaction_question',index)} type="radio" name={"radio"+index}/>
                                                        <span className='lh-sm fs-5- fontLight- tx-dark-purple-'>3</span>
                                                        </label>
                                                    </div>
                                                    <div className='checks-radios- me-1'>
                                                        <label>
                                                        <input onChange={(event)=>ReadCheckBox(event,4,'satisfaction_question',index)}   type="radio" name={"radio"+index}/>
                                                        <span className='lh-sm fs-5- fontLight- tx-dark-purple-'>4</span>
                                                        </label>
                                                    </div>
                                                    <div className='checks-radios- me-1'>
                                                        <label>
                                                        <input onChange={(event)=>ReadCheckBox(event,5,'satisfaction_question',index)}   type="radio" name={"radio"+index}/>
                                                        <span className='lh-sm fs-5- fontLight- tx-dark-purple-'>5</span>
                                                        </label>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        :
                                        <div key={index} className='row g-0 g-sm-0 g-md-2 g-lg-2 g-xl-2 g-xxl-2 mt-3'>
                                            <div className='col-12 d-flex flex-column flex-sm-column flex-md-column flex-lg-column flex-xl-column flex-xxl-column justify-content-between align-items-center align-self-center mb-2'>
                                                <p className='m-0 me-0 me-sm-3 me-md-3 me-lg-3 me-xl-3 me-xxl-3 mb-3 lh-sm text-center fs-5- fontLight- fw-normal tx-light-black-' dangerouslySetInnerHTML={{ __html: obj?.open_questionary_optional?.question.replace(/\r\n/g, '<br>').replace(/\n/g, '<br>').replace(/\r/g, '') }}/>
                                                <div className='d-flex flex-row justify-content-start justify-content-sm-start justify-content-md-start justify-content-lg-start justify-content-xl-start justify-content-xxl-start align-items-center align-self-center'>
                                                <textarea onChange={(event)=>ReadTextArea(event,index)}  className='form-control fontLight ' rows="4" placeholder='Ingresar'></textarea>
                                                </div>
                                            </div>
                                        </div>
                                        }
                                        
                                    </>
                                    
                                )
                            })}
                            
                            <div  className='ContainerButton_2'>
                                <div onClick={RegisterSurvey} className='Button_2' style={{'marginTop':'20px'}}>
                                            <span className='text_button_2'>Registrar</span>
                                </div>
                            </div>
                        </form>
                    </div>
                    </div>
                </div>
                </div>
        </Offcanvas>
        </>
        
    )
}
