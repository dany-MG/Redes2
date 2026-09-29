import { flota } from '../models/flota.js';
import { crearTablero, colocarFlotaRandom, colocarBarco } from '../utils/tablero.js';
import dgram from 'dgram';

const cliente = dgram.createSocket('udp4');

const tableroServidor = crearTablero()
colocarFlotaRandom(tableroServidor, flota)

// Evento para recibir la respuesta del servidor
cliente.on('message', (msg, rinfo) => {
  console.log(`Cliente recibió: "${msg}" desde ${rinfo.address}:${rinfo.port}`);
  // Cerramos el socket del cliente tras recibir la respuesta
  cliente.close(); 
});

let mensajeTableroServidor = Buffer.from(JSON.stringify({tablero: tableroServidor}))

cliente.send(mensajeTableroServidor, 41234, 'localhost', (err) => {
  if (err) {
    console.error('Error al enviar el mensaje');
    cliente.close();
  } else {
    console.log('Datagrama enviado al servidor...');
  }
});