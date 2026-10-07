import readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';

let rl = null

export const pedirCoords = async (cliente, tirosRestantes) => {
  if(!rl) rl = readline.createInterface({input, output})
    console.log(`\n --- TU TURNO ---\n`)
    console.log(`Tienes ${tirosRestantes} tiros`)
    let fila = parseInt(await rl.question('Ingresa la Fila (0 a 9): '), 10)
    let col = parseInt(await rl.question('Ingresa la columna (0 a 9): '), 10)

    if (isNaN(fila) || isNaN(col) || fila < 0 || fila > 9 || col < 0 || col > 9) {
    console.log("Coordenadas inválidas. Deben ser números entre 0 y 9.");
    return pedirCoords(cliente, tirosRestantes);
  }
  const msgTiro = Buffer.from(JSON.stringify({ tipo: "tiro", fila, col }));
  cliente.send(msgTiro, 41234, 'localhost');
}

export const realizarTiroPC = (tableroTirosPC) => {
  let fila, col
  do{
    fila = Math.floor(Math.random() * 10)
    col = Math.floor(Math.random() * 10)
  }while(tableroTirosPC[fila][col] !== 0)
  console.log(`PC dispara a las coordenadas [${fila}, ${col}]`)
  return {fila,col}
}