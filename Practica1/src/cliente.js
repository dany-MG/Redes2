const dgram = require('dgram');
const cliente = dgram.createSocket('udp4');

const flota = [
  { id: 1, tipo: 'Submarino', longitud: 5 },
  { id: 2, tipo: 'Acorazado', longitud: 4 },
  { id: 3, tipo: 'Crucero 1', longitud: 3 },
  { id: 4, tipo: 'Crucero 2', longitud: 3 },
  { id: 5, tipo: 'Destructor 1', longitud: 2 },
  { id: 6, tipo: 'Destructor 2', longitud: 2 },
  { id: 7, tipo: 'Destructor 3', longitud: 2 }
];

const crearTablero = () => {
    return Array.from({length: 10}, () => Array(10).fill(0))
}
// 0 - Agua
// 1 a N - Casillas dle barco
// -1 Fallo
// -2 Tiro preciso

const colocarBarco = () => {
  if(esHorizontal){
    if (colStart + nave.longitud > 10) return false;
  }else{
    if(rowStart + nave.logitud > 10) return false;
  }
  for(i = 0; i<nave.longitud; i++){
  let  f = esHorizontal ? rowStart : rowStart + i
  let c = esHorizontal ? colStart + i: colStart
  if (tablero[f][c] !== 0){
    return false
  }
}

  for(i = 0; i < nave.longitud; i++){
    let  f = esHorizontal ? rowStart : rowStart + i
    let c = esHorizontal ? colStart + i: colStart
    tablero[f][c] = nave.id
  } 
  return true
}



const tableroNaves = crearTablero()
const tableroTiros = crearTablero()

const datosString = JSON.stringify({"tablero" : tableroNaves})
const mTablero = Buffer.from(datosString); 

// Evento para recibir la respuesta del servidor
cliente.on('message', (msg, rinfo) => {
  console.log(`Cliente recibió: "${msg}" desde ${rinfo.address}:${rinfo.port}`);
  // Cerramos el socket del cliente tras recibir la respuesta
  cliente.close(); 
});

cliente.send(mTablero, 41234, 'localhost', (err) => {
  if (err) {
    console.error('Error al enviar el mensaje');
    cliente.close();
  } else {
    console.log('Datagrama enviado al servidor...');
  }
});