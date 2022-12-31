import { createMoves } from "./createMoves"
import { GameState } from "./GameState"
import { Move } from "./Move"
import { makeSimulator } from "./Simulation"
import { arrayMaxIdxBy } from "./Tools"

export function makeSimpleSearch(gridWidth: number, gridHeight: number) {

   const simulator = makeSimulator(gridWidth, gridHeight)

   return function bestMove(state: GameState): Move {

      const moves = createMoves(state)

      //const selectedMove = Math.floor(Math.random() * moves.length)
      const selectedMove = arrayMaxIdxBy(moves, ([myMove]) => myMove.length)

      console.error("found ", moves.length, " moves", selectedMove + 1)
      console.error(Move.toString(moves[selectedMove]))

      return moves[selectedMove]
   }
}