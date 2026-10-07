import { flota } from '../models/flota.js';
import { crearTablero, colocarBarco, colocarFlotaRandom, verificarDisparo } from '../utils/tablero.js';
import dgram from 'dgram';
import { WebSocketServer } from 'ws';

const clienteUDP = dgram.createSocket('udp4');
const wss = new WebSocketServer({ port: 8080 });

let wsFrontend = null;
let tableroFlotaCliente = crearTablero();
let tableroTirosCliente = crearTablero();

const enviarAlFrontend = (datos) => {
  if (wsFrontend && wsFrontend.readyState === 1) {
    wsFrontend.send(JSON.stringify(datos));
  }
};

wss.on('connection', (ws) => {
  wsFrontend = ws;
  console.log('Interfaz Gráfica 3D conectada.');

  ws.on('message', (msg) => {
    const datos = JSON.parse(msg.toString());

    if (datos.tipo === 'iniciar_solicitud') {
      tableroFlotaCliente = crearTablero();
      tableroTirosCliente = crearTablero();
      const mSolicitud = Buffer.from(JSON.stringify({
        tipo: "solicitud",
        nombreCliente: datos.nombre
      }));
      clienteUDP.send(mSolicitud, 41234, 'localhost');
    }

    else if (datos.tipo === 'colocar_barco_ui') {
      const nave = flota[datos.indiceNave];
      const exito = colocarBarco(tableroFlotaCliente, nave, datos.fila, datos.col, datos.esHorizontal);
      enviarAlFrontend({
        tipo: 'resultado_colocar',
        exito,
        fila: datos.fila,
        col: datos.col,
        esHorizontal: datos.esHorizontal,
        nave,
        indiceSiguiente: datos.indiceNave + 1,
        totalNaves: flota.length
      });
    }

    else if (datos.tipo === 'colocar_random_ui') {
      tableroFlotaCliente = crearTablero(); // Limpiamos por si ya había puesto alguno manual
      const posiciones = colocarFlotaRandom(tableroFlotaCliente, flota);
      console.log('[Cliente] Flota generada aleatoriamente:');
      console.table(tableroFlotaCliente);

      enviarAlFrontend({
        tipo: 'resultado_colocar_random',
        posiciones
      });
    }

    else if (datos.tipo === 'flota_lista_ui') {
      const mFin = Buffer.from(JSON.stringify({ tipo: "colocacion_fin" }));
      clienteUDP.send(mFin, 41234, 'localhost');
    }

    else if (datos.tipo === 'disparar_ui') {
      const mTiro = Buffer.from(JSON.stringify({
        tipo: "tiro",
        fila: datos.fila,
        col: datos.col
      }));
      clienteUDP.send(mTiro, 41234, 'localhost');
    }
  });
});

clienteUDP.on('message', (msg) => {
  const respuestaServidor = JSON.parse(msg.toString());

  if (respuestaServidor.tipo === "inicio") {
    enviarAlFrontend({ tipo: "fase_colocacion", flota });
  } 
  else if (respuestaServidor.tipo === "turno_cliente") {
    enviarAlFrontend({ tipo: "turno_cliente", tirosRestantes: respuestaServidor.tirosRestantes });
  } 
  else if (respuestaServidor.tipo === "resultado_tiro") {
    tableroTirosCliente[respuestaServidor.fila][respuestaServidor.col] = respuestaServidor.exito ? 'X' : '0';
    enviarAlFrontend(respuestaServidor);
  } 
  else if (respuestaServidor.tipo === "turno_pc") {
    const res = verificarDisparo(tableroFlotaCliente, respuestaServidor.fila, respuestaServidor.col);
    enviarAlFrontend({
      tipo: "ataque_pc",
      fila: respuestaServidor.fila,
      col: respuestaServidor.col,
      ...res
    });

    const respuesta = Buffer.from(JSON.stringify({
      tipo: "tiro_pc",
      fila: respuestaServidor.fila,
      col: respuestaServidor.col,
      ...res
    }));
    clienteUDP.send(respuesta, 41234, 'localhost');
  } 
  else if (respuestaServidor.tipo === "fin_juego") {
    enviarAlFrontend({ tipo: "fin_juego", ganador: respuestaServidor.ganador });
  }
});

console.log('Puente Cliente UDP <-> Web3D activo en ws://localhost:8080');