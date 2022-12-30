import { GameState } from "./GameState"
import { readGameState } from "./input"
import { outputAction, outputWait } from "./output"
import { makeSimpleSearch } from "./SimpleSearch"

import { deflateSync } from "node:zlib"

declare let readline: () => string

const initialInputs = readline().split(" ")
const gridWidth = parseInt(initialInputs[0])
const gridHeight = parseInt(initialInputs[1])

const findBestMove = makeSimpleSearch(gridWidth, gridHeight)

let turn = 0

// noinspection InfiniteLoopJS
while (true) {

   turn++

   const gameState = readGameState(gridWidth, gridHeight, turn, readline)

   const serializedGameState = GameState.serialize(gameState)
   const compressedSerializedGameState = deflateSync(serializedGameState).toString("base64")
   console.error(compressedSerializedGameState)

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
