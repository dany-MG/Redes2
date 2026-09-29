import { flota } from '../models/flota.js';
import { crearTablero, colocarFlotaRandom, colocarBarco } from '../utils/tablero.js';
import dgram from 'dgram';
import {text} from 'node:stream/consumers'

const cliente = dgram.createSocket('udp4');

const tableroCliente = crearTablero()
colocarFlotaRandom(tableroCliente, flota)

// Evento para recibir la respuesta del servidor
cliente.on('message', (msg, rinfo) => {
  console.log(`Cliente recibió: "${msg}" desde ${rinfo.address}:${rinfo.port}`);
  // Cerramos el socket del cliente tras recibir la respuesta
  cliente.close(); 
});

let mensajeSolicitudInicial = Buffer.from(JSON.stringify({tipo: "solicitud", nombreCliente: "Dany"}))

cliente.send(mensajeSolicitudInicial, 41234, 'localhost', (err) => {
  if (err) {
    console.error('Error al enviar el mensaje');
    cliente.close();
  } else {
    console.log('Datagrama enviado al servidor...');
  }
});