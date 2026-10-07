export const crearTablero = () => {
    return Array.from({length: 10}, () => Array(10).fill(0))
}
// 0 - Agua
// 1 a N - Casillas del barco
// '0' Fallo
// 'X' Tiro preciso

export const colocarBarco = (tablero, nave, rowStart, colStart, esHorizontal) => {
  if(esHorizontal){
    if (colStart + nave.longitud > 10) return false;
  }else{
    if(rowStart + nave.longitud > 10) return false;
  }
  for(let i = 0; i<nave.longitud; i++){
  const f = esHorizontal ? rowStart : rowStart + i
  const c = esHorizontal ? colStart + i: colStart
  if (tablero[f][c] !== 0){
    return false
  }
}

  for(let i = 0; i < nave.longitud; i++){
    let f = esHorizontal ? rowStart : rowStart + i
    let c = esHorizontal ? colStart + i: colStart
    tablero[f][c] = nave.id
  } 
  return true
}

export const colocarFlotaRandom = (tablero, flota) => {
  const posiciones = []; // Guardará dónde quedó cada barco para el 3D

  flota.forEach(barco => {
    let colocado = false;
    while (!colocado) {
      let filaRandom = Math.floor(Math.random() * 10);
      let colRandom = Math.floor(Math.random() * 10);
      let esHorizontal = Math.random() < 0.5;
      colocado = colocarBarco(tablero, barco, filaRandom, colRandom, esHorizontal);

      if (colocado) {
        posiciones.push({
          nave: barco,
          fila: filaRandom,
          col: colRandom,
          esHorizontal
        });
      }
    }
  });

  return posiciones;
};

export const verificarDisparo = (tableroFlota, fila, columna) => {
  let valorCasilla = tableroFlota[fila][columna]
  if(valorCasilla === 0 || valorCasilla === '0' || valorCasilla === 'X'){
    if(valorCasilla === 0) tableroFlota[fila][columna] = '0' //marcamos casilla aunque haya un fallo
    return {exito: false, barcoHundido: false, idNave: null}
  }

  tableroFlota[fila][columna] = 'X'
  let sigueAflote = false
  let quedanNaves = false
  for(let f = 0; f<10; f++){
    for(let c =0; c<10; c++){
      let casilla = tableroFlota[f][c]
      if(tableroFlota[f][c] === valorCasilla){
          sigueAflote = true
        }
      if(typeof casilla === 'number' && casilla > 0)
        quedanNaves = true
    }
  }
  return {
    exito: true,
    barcoHundido : !sigueAflote,
    idNave : valorCasilla,
    juegoTerminado: !quedanNaves
  }
}

