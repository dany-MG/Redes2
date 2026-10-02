import { flota } from '../models/flota.js';
import { crearTablero, colocarFlotaRandom, colocarBarco, verificarDisparo} from '../utils/tablero.js';
import {pedirCoords} from '../utils/tiros.js'
import dgram from 'dgram';

const cliente = dgram.createSocket('udp4');

let tableroFlotaCliente = crearTablero()
let tableroTirosCliente = crearTablero()

let nombreUsuario = ""

// Evento para recibir la respuesta del servidor
cliente.on('message',async  (msg, rinfo) => {
  let respuestaServidor = JSON.parse(msg.toString())
  if(respuestaServidor.tipo === "inicio"){
    // colocarBarcos() o colocoarFlotaRandom
    console.log(`El servidor ha mandado: ${respuestaServidor.tipo}. Cliente acomoda tu flota...`)
    colocarFlotaRandom(tableroFlotaCliente, flota)
    console.log('[Cliente] Mi tablero:')
    console.table(tableroFlotaCliente)
    
    let mColocacionFlota = Buffer.from(JSON.stringify({tipo : "colocacion_fin"}))
    cliente.send(mColocacionFlota, 41234, 'localhost', (err) =>{
      if(!err){
        console.log("Aviso de listo enviado al servidor")
      }else console.log(`Error: ${err}`)
    })
  }else if(respuestaServidor.tipo === "turno_cliente"){
    await  pedirCoords(cliente, respuestaServidor.tirosRestantes)

  }else if(respuestaServidor.tipo === "resultado_tiro"){
    tableroTirosCliente[respuestaServidor.fila][respuestaServidor.col] = respuestaServidor.exito ? 'X' : '0'
    console.log(`\nDisparo en [${respuestaServidor.fila}, ${respuestaServidor.col}]: ${respuestaServidor.exito ? '¡ACIERTO (X)!' : 'Fallo en agua (O)'}`)
    if(respuestaServidor.barcoHundido) console.log(`Hundiste el barco con id: ${respuestaServidor.idNave} de la PC`)
    console.log("Tu Tablero de Tiros (Ataques hechos a la PC):");
    console.table(tableroTirosCliente);

    if(respuestaServidor.tirosRestantes > 0){
      await pedirCoords(cliente, respuestaServidor.tirosRestantes)
    }else{
      console.log("Termino tu turno. Esperando tiros de la PC...")
    }
  }else if(respuestaServidor.tipo === "turno_pc"){
    let res = verificarDisparo(tableroFlotaCliente, respuestaServidor.fila, respuestaServidor.col)
    console.log(`\nLa PC disparo en [${respuestaServidor.fila}, ${respuestaServidor.col}]: ${res.exito ? 'Te dieron (X)' : 'Fallo (0)'}`)
    if(res.barcoHundido) console.log(`La PC hundio tu nave con ID: ${res.idNave}`)
    console.log("Tu tablero de Naves actualizado")
    console.table(tableroFlotaCliente)

    const respuesta = Buffer.from(JSON.stringify({
      tipo: "resultado_pc",
      fila: respuestaServidor.fila,
      col: respuestaServidor.col,
      ...res
    }));
    cliente.send(respuesta, 41234, 'localhost');
  }
});

//TO DO: Implementar la solicitud del nombre del usuario.
let mensajeSolicitudInicial = Buffer.from(JSON.stringify({tipo: "solicitud", nombreCliente: "Dany"}))
cliente.send(mensajeSolicitudInicial, 41234, 'localhost', (err) => {
  if (err) {
    console.error('Error al enviar el mensaje');
    cliente.close();
  } else {
    console.log('Solicitud de juego enviada al servidor...')
  }
});