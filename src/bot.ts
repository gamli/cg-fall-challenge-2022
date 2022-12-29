import { readGameState } from "./input"
import { outputAction, outputMessage, outputWait } from "./output"
import { makeSimpleSearch } from "./SimpleSearch"

declare let readline: () => string

const readlineOriginal = readline
readline = () => {
   const line = readlineOriginal()
   console.error(line)
   return line
}

const initialInputs = readline().split(" ")
const gridWidth = parseInt(initialInputs[0])
const gridHeight = parseInt(initialInputs[1])

const findBestMove = makeSimpleSearch(gridWidth, gridHeight)

let turn = 0

// noinspection InfiniteLoopJS
while (true) {

   turn++

   const gameState = readGameState(gridWidth, gridHeight, turn, readline)

   const bestMove = findBestMove(gameState)

   let output = ""
   for (const myActions of bestMove[0]) {
      output += outputAction(myActions)
   }
   if (output === "") {
      output = outputWait()
   }
   console.log(output)
}
