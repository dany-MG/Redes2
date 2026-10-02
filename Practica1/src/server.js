import { flota } from '../models/flota.js';
import { crearTablero, colocarFlotaRandom, colocarBarco, verificarDisparo} from '../utils/tablero.js';
import {realizarTiroPC} from '../utils/tiros.js'
import dgram from 'dgram';

const servidor = dgram.createSocket('udp4');

let cliente = null
let tableroNavesServer = null
let tableroTirosServer = null
let tirosRestantes = 3

const dispararPC = () => {
  const { fila, col } = realizarTiroPC(tableroTirosServer);
  const msgTiroPC = Buffer.from(JSON.stringify({ tipo: "turno_pc", fila, col }));
  servidor.send(msgTiroPC, cliente.port, cliente.address);
};

// Evento que se dispara cuando hay un error
servidor.on('error', (err) => {
  console.log(`Error del servidor:\n${err.stack}`);
  servidor.close();
});

// Evento que se dispara cada vez que recibe un datagrama
servidor.on('message', (msg, rinfo) => {
  const datosRecibidos = JSON.parse(msg.toString());
  if(cliente !== null){
    if(cliente.address !== rinfo.address || cliente.port !== rinfo.port){
      console.log('** Cliente intruso **')
      return
    }
  }
  if (datosRecibidos.tipo === "solicitud" && cliente === null){
    cliente = {
      address : rinfo.address,
      port : rinfo.port,
      nombre : datosRecibidos.nombreCliente,
    }
    console.log(`El jugador ${datosRecibidos.nombreCliente} quiere jugar desde ${rinfo.address}: ${rinfo.port}`)

    let respuesta = Buffer.from(JSON.stringify({tipo: "inicio"}))
    servidor.send(respuesta, rinfo.port, rinfo.address)
  }else if(datosRecibidos.tipo === "colocacion_fin"){
    console.log(`El jugador ${cliente.nombre} ha colocado su flota y esta listo para jugar.`)
    tableroNavesServer = crearTablero()
    tableroTirosServer = crearTablero()
    colocarFlotaRandom(tableroNavesServer, flota) //TO DO: implementar la funcionar par q el usuario coloque sus flotas manualmente
    console.log(`[Servidor] Mi flota:`)
    console.table(tableroNavesServer)

    let iniciaCliente = Math.random() < 0.5
 
    if(iniciaCliente){
      console.log(`Inicia tirando el jugador ${cliente.nombre}`)
      let turnoCliente = Buffer.from(JSON.stringify({tipo: "turno_cliente", tirosRestantes}))
      servidor.send(turnoCliente, cliente.port, cliente.address)
    }else{
      console.log("Inicia tirando la PC")
     dispararPC()
    }
  }else if(datosRecibidos.tipo === "tiro"){
    let res =  verificarDisparo(tableroNavesServer, datosRecibidos.fila, datosRecibidos.col)
    console.log(`Cliente disparó en [${datosRecibidos.fila}, ${datosRecibidos.col}] -> ${res.exito ? 'Acierto (X)' : 'Fallo (O)'}`);
    console.table(tableroNavesServer);
    tirosRestantes = res.exito ? tirosRestantes - 1 : 0
    
    let respuestaServer = Buffer.from(JSON.stringify({
      tipo: "resultado_tiro",
      fila: datosRecibidos.fila,
      col: datosRecibidos.col,
      exito: res.exito,
      barcoHundido: res.barcoHundido,
      idNave: res.idNave,
      tirosRestantes
    }))
    servidor.send(respuestaServer, cliente.port, cliente.address)

    if(tirosRestantes === 0){
      tirosRestantes = 3
      setTimeout(dispararPC, 1500)
    }
  }else if(datosRecibidos.tipo === "resultado_pc"){
    tableroTirosServer[datosRecibidos.fila][datosRecibidos.columna] = datosRecibidos.exito ? 'X' : '0'
    console.log(`Resultado del tiro de PC en [${datosRecibidos.fila}, ${datosRecibidos.col}]: ${datosRecibidos.exito ? 'Acierto (X)' : 'Fallo (0)'}`)
    console.log("Tablero de tiros PC")
    console.table(tableroTirosServer)

    tirosRestantes = datosRecibidos.exito ? tirosRestantes - 1 : 0

    if(tirosRestantes > 0){
      setTimeout(dispararPC, 1500)
    }else{
      console.log(`Turno de PC terminado. Pasa el turno a ${cliente.nombre}`)
      tirosRestantes = 3
      servidor.send(Buffer.from(JSON.stringify({tipo : "turno_cliente", tirosRestantes})), cliente.port, cliente.address)
    }
  }
});

// Evento que confirma que el servidor está encendido y escuchando
servidor.on('listening', () => {
  const address = servidor.address();
  console.log(`Servidor UDP escuchando en ${address.address}:${address.port}`);
});

// Iniciar el servidor en el puerto 41234
servidor.bind(41234)