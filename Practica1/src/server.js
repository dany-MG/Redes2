import { flota } from '../models/flota.js';
import { crearTablero, colocarFlotaRandom, colocarBarco } from '../utils/tablero.js';
import dgram from 'dgram';

const servidor = dgram.createSocket('udp4');

const tableroServidor = crearTablero()
colocarFlotaRandom(tableroServidor, flota)

// Evento que se dispara cuando hay un error
servidor.on('error', (err) => {
  console.log(`Error del servidor:\n${err.stack}`);
  servidor.close();
});

// Evento que se dispara cada vez que recibe un datagrama
servidor.on('message', (msg, rinfo) => {
  const datosRecibidos = JSON.parse(msg.toString());
  if (datosRecibidos.tipo == "solicitud"){
    console.log(`El jugador ${datosRecibidos.nombreCliente} quiere jugar desde ${rinfo.address}: ${rinfo.port}`)

    let respuesta = Buffer.from(JSON.stringify({tipo: "inicio"}))
    servidor.send(respuesta, rinfo.port, rinfo.address)
  }
  console.log(datosRecibidos)
});

// Evento que confirma que el servidor está encendido y escuchando
servidor.on('listening', () => {
  const address = servidor.address();
  console.log(`Servidor UDP escuchando en ${address.address}:${address.port}`);
});

// Iniciar el servidor en el puerto 41234
servidor.bind(41234)