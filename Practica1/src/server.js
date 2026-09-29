const dgram = require('dgram');
const servidor = dgram.createSocket('udp4');

const crearTablero = () => {
    Array.from({length: 10}, () => Array(10).fill(0))
}

const tableroNaves = crearTablero()
const tableroTiros = crearTablero()

// Evento que se dispara cuando hay un error
servidor.on('error', (err) => {
  console.log(`Error del servidor:\n${err.stack}`);
  servidor.close();
});

// Evento que se dispara cada vez que recibe un datagrama
servidor.on('message', (msg, rinfo) => {
  const datosRecibidos = JSON.parse(msg.toString());
  
  // Ahora puedes acceder a la matriz
  const tableroDelCliente = datosRecibidos.tablero; 
  console.log(tableroDelCliente);
});

// Evento que confirma que el servidor está encendido y escuchando
servidor.on('listening', () => {
  const address = servidor.address();
  console.log(`Servidor UDP escuchando en ${address.address}:${address.port}`);
});

// Iniciar el servidor en el puerto 41234
servidor.bind(41234);