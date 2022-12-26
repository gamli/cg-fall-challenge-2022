import { readGameState } from "./input"
import { outputAction } from "./output"
import { makeSimpleSearch } from "./SimpleSearch"

const initialInputs = readline().split(" ")
const gridWidth = parseInt(initialInputs[0])
const gridHeight = parseInt(initialInputs[1])

const findBestMove = makeSimpleSearch(gridWidth, gridHeight)

let turn = 0

// noinspection InfiniteLoopJS
while (true) {

   turn++
   
   const gameState = readGameState(gridWidth, gridHeight, turn)

   const bestMove = findBestMove(gameState)

   let output = ""
   for (const myActions of bestMove[0]) {
      output += outputAction(myActions)
   }
   console.log(output)
}
