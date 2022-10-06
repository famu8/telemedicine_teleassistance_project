var app = rpc("172.20.10.6", "MiGestionPacientes");


// debo definir las funciones que recojo del servidor 
var login = app.procedure("login");
var datosMedico = app.procedure("datosMedico");
var listadoMuestras = app.procedure("listadoMuestras");
var agregarMuestra =app.procedure("agregarMuestra");
var eliminarMuestra=app.procedure("eliminarMuestra");
var  duplicarMuestrafunc=app.procedure("duplicarMuestrafunc");

//variables globales
var seccionActual = "login";
var idMedicoGlobal;
var idPacienteGlobal;
var pacienteGlobal=[];
var todasLasMuestras=[];

//funcion para ir cambiando de pestañas
function cambiarSeccion(seccion){   
    document.getElementById(seccionActual).classList.remove("activa");
    document.getElementById(seccion).classList.add("activa");
    seccionActual=seccion;
}
//funcion para slair al menu principal
function salir(){
    cambiarSeccion("login");
    //recargar la pagina
    location.reload();
}



//creo la conexion al webSocket fuera para hacerla global 
//debo hacer esto porque si quiero que el ws no haga nada hasta que la funcion log in 
//no se ejcute, debe de ser asi --> ver funcion openWs()
//ademas debo de crear conexion como global para pdoer enviar mensjaes desde diferentes funciones 
//al servidor
var conexion ="";

function logearAsincrono(){
    var codAcc= document.getElementById("codAcc").value;
    //console.log(codAcc);
    login(codAcc,function(pacienteActual){
        //console.log("Este Es el paciente que me llega del server: ",pacienteActual);
        if(pacienteActual!=null){
            //recojo los pacientes en la variable global
            pacienteGlobal=pacienteActual;
            //recojo el id del medico y del paciente para futuras funciones
            idMedicoGlobal=pacienteActual.idMedicoPaciente;
            //console.log("id del medico global",idMedicoGlobal);
            idPacienteGlobal=pacienteActual.idPaciente;
            //console.log(idPacienteGlobal);

            //creo esta funcion para abrir el ws en el main y recoger los
            //Datos que me envia el server
            openWs();
            
            //console.log("El paciente se ha logeado");
            cambiarSeccion("listaPacientes");

            //mostrar el nombre etc..variables y muestras
            mostrarDatosMedico();
            mostrarMuestras();
            //mostrarVariables();
        }else{
            alert("Error, el paciente no se ha logeado");
        }
    });
}

function mostrarDatosMedico(){
    datosMedico(idMedicoGlobal, function(datosMed){
        //console.log("este es el medico:", datosMed)
        if(datosMed!=null){
            var bienvenida=document.getElementById("bienvenida"); 
            bienvenida.innerHTML = "Bienvenido/a al menú principal." +" ¡ "+ pacienteGlobal.nombrePaciente +" ! <br>" +"Tu medico es : " + datosMed.nombreMedico + "<br> Observaciones: " + pacienteGlobal.observacionesPaciente;
        }else{
            alert("El medico no existe");
        }
    });
}

function mostrarMuestras(){
    var listaMuestras="";
    //console.log("Id del paciente que estamos viendo: ",idPaciente);
    listadoMuestras(idPacienteGlobal,function(muestraActual){
        todasLasMuestras=muestraActual;
        //console.log("meustra que me llega: ",muestraActual);
        var variableForm = document.getElementById("filtrar").value;
        //console.log("Esta es la variable elegida: ",variableForm);
        if(muestraActual!==null){  
            //se pone '0' porque es el valor asignado a 'Mostrar Todo' lo que hace es imprimir todas las muestras
            if(variableForm!=='0'){
                for(var i=0; i< muestraActual.length;i++){
                    if(variableForm==muestraActual[i].idVariable_muestras){
                        listaMuestras+="<li>"+ "Muestra: "+i+" --- "+ "ID: "+ muestraActual[i].idMuestra +"-- Variable: "+ muestraActual[i].idVariable_muestras+"-- Valor:  "+muestraActual[i].valorMuestra+"-- Fecha: "+muestraActual[i].fechaMuestra+  " <button onclick='eliminarMain(" + muestraActual[i].idMuestra + ")'>Eliminar</button> <button onclick='compartir("+muestraActual[i].idMuestra+")'>Compartir</button></li>";
                    }
                }
                document.getElementById("listaMuestras").innerHTML=listaMuestras;
            }else{
                for(var i=0; i<muestraActual.length;i++){
                    listaMuestras+="<li>"+ "Muestra: "+i+" --- "+ "ID: "+ muestraActual[i].idMuestra +"-- Variable: "+ muestraActual[i].idVariable_muestras+"-- Valor:  "+muestraActual[i].valorMuestra+"-- Fecha: "+muestraActual[i].fechaMuestra+  " <button onclick='eliminarMain(" + muestraActual[i].idMuestra + ")'>Eliminar</button> <button onclick='compartir("+muestraActual[i].idMuestra+")'>Compartir</button></li>";
                }
                document.getElementById("listaMuestras").innerHTML=listaMuestras;
            }
        }else{
            alert("No se han obtenido las muestras del paciente");
        }
    });
}

function anyadirMuestras(){
    //recojo el id de la variable que quiero añadir y la fecha y valor
    var idvariableActual=document.getElementById("listaVariables").value;
    var nuevaMuestra={    
        fecha: document.getElementById("fechaNuevaMuestra").value,
        valor: document.getElementById("valorNuevaMuestra").value,
    };
    //console.log(nuevaMuestra);
    //console.log("ID de la variable",nuevaMuestra.idVariable);
    //console.log("fecha: ",nuevaMuestra.fecha);
    //console.log("valor de la muestra",nuevaMuestra.valor);
    //console.log("ID del paciente",idPaciente);
    if(idvariableActual=="" || nuevaMuestra.fecha=="" || nuevaMuestra.valor==""){
        alert("Selecciona un valor para cada campo");
    }else{
        agregarMuestra(idPacienteGlobal, idvariableActual, nuevaMuestra.fecha, nuevaMuestra.valor, function(idNuevaMuestra){
            if(idNuevaMuestra==0){
                alert("No se ha podido añadir la muestra.");
                document.getElementById("listaVariables").value="";
                document.getElementById("fechaNuevaMuestra").value="";
                document.getElementById("valorNuevaMuestra").value="";
                cambiarSeccion("listaPacientes");
            }else{
                alert("Se ha añadido la muestra");
                //recargar el 'formulario'
                document.getElementById("listaVariables").value="";
                document.getElementById("fechaNuevaMuestra").value="";
                document.getElementById("valorNuevaMuestra").value="";
                cambiarSeccion("listaPacientes");
                mostrarMuestras();
            }
        });   
    }
}


function eliminarMain(idValor){
    //eliminado es un booleano
    eliminarMuestra(idValor,function(eliminado){
        //if elimiando==true
        if(eliminado){
            alert("Se ha elimiando la muestra");
            mostrarMuestras();
        }else{
            alert("No se ha eliminado la muestra");
        }
    });
}













///////////////////////////////////////////////////////////////////////////////////7





//para abajo websocket





//creo dos arrays de pacientes, uno para los filtrados(con los que comparto medico)
//y otro para lso que me envia el web socket del lado del servidor
var pacsFiltrados=[];
//array global para comaprtir la muestra a los usuarios que quiero
var muestraACompartir=[];


//funcion para filtrar la meustra que voy a compartir con los amigos
function filtrarMuestra(idMuestra){
    var muestraFiltrada=[];
    //console.log("estas son todas las meustras:",todasLasMuestras)
    for(var i=0;i<todasLasMuestras.length;i++){
        if(idMuestra==todasLasMuestras[i].idMuestra){
            muestraFiltrada=todasLasMuestras[i];
        }
    }
    return muestraFiltrada;
}

function compartir(idMuestra){
    //console.log("Muestra con ID: ",idMuestra);
    muestraACompartir=filtrarMuestra(idMuestra);
    //console.log("Esta es la muestra que vas a compartir:",muestraACompartir);
    cambiarSeccion("divCompartir");
    //creamos el select
    createSelect();
}

//Creo unc entinela para que los apcientes nos e doblen en el select
//si centinale==false se crea de neuvo el select 
//else: NO se crea de nuevo el select y NO se doblan los pacientes

function createSelect(){
    var select = "";
    select+="<optgroup label=NoAmigos>";
    select+="<option value="+-1+"> Medico </option>";
    select+="<option value="+-2+"> Todos </option>";
    select+="</optgroup>";
    select+="<optgroup label=Amigos>";
    for(var i = 0; i < pacsFiltrados.length; i++){
        select+="<option id=" + pacsFiltrados[i].idPaciente +"  value="+pacsFiltrados[i].idPaciente+"> " + pacsFiltrados[i].nombrePaciente + "</option>";
    }
    select.innerHTML+="</optgroup>";
    document.getElementById("formCompartir").innerHTML=select;
}


function openWs(){
    conexion = new WebSocket('ws://localhost:4444', "pacientes");
    // Connection opened 
    //con esto le digo al server que estoy conectado
    conexion.addEventListener('open', function (event) {
        console.log("SOY EL WEBSOCKET MAIN!!!");
        //le envio solo el rol de apciente porque desde este
        //Cliente solo entran pacientes
        conexion.send(JSON.stringify({operacion:"login",rol:"paciente",idMedico:idMedicoGlobal,idPaciente:idPacienteGlobal}));
    });

    //cuando recibo un mensaje, se ejecuta el callback
    conexion.addEventListener('message', function (event) {
        var msg=JSON.parse(event.data);
        switch(msg.operacion){
            case "recibirAmigos":
                pacsFiltrados=msg.pacientesTodos;
                break;
            case "notificar":
                var mensajeEmergente=msg.nombre+" ha compartido contigo que el día " + msg.muestra.fechaMuestra
                    +" realizó la actividad "+  msg.variable + " y obtuvo un valor de " +msg.muestra.valorMuestra;
                alert(mensajeEmergente);      
                break;
        }        
    });
}

function enviar(){
    var selectValue=document.getElementById("formCompartir").value;
    console.log("Valor del select: ",selectValue);
    //Creo el  mensaje que voy a enviar al servidor
    switch (selectValue) {
        case "-1": //medico
        //le envio el nombre global del paciente para mostrarlo en el alert del medico
            conexion.send(JSON.stringify({operacion: "enviar",
                valorSelect: selectValue, muestra:muestraACompartir,rol:"medico",
                nombre:pacienteGlobal.nombrePaciente,idMedico:idMedicoGlobal}));
            break;
        case "-2": //todos
            conexion.send(JSON.stringify({operacion: "enviar",
            valorSelect: selectValue, muestra:muestraACompartir, rol:"todos",nombre:pacienteGlobal.nombrePaciente}));
            break;
        default://un paciente en concreto
            conexion.send(JSON.stringify({operacion: "enviar",
            valorSelect: selectValue, muestra:muestraACompartir, rol:"paciente",nombre:pacienteGlobal.nombrePaciente}));
            break;
        
    }
   //Dejo el formulario de envio del value vacio
    alert("Has compartido tu logro!");
    cambiarSeccion("listaPacientes");
}









