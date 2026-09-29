export const crearTablero = () => {
    return Array.from({length: 10}, () => Array(10).fill(0))
}
// 0 - Agua
// 1 a N - Casillas dle barco
// -1 Fallo
// -2 Tiro preciso

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

export const colocarFlotaRandom = (tablero, flota) =>{
  flota.forEach(barco =>{
    let colocado = false
    while(!colocado){
      let filaRandom = Math.floor(Math.random() * 10)
      let colRandom = Math.floor(Math.random() * 10)
      let esHorizontal = Math.random() < 0.5
      colocado = colocarBarco(tablero, barco, filaRandom, colRandom, esHorizontal)
    }
  })
}

