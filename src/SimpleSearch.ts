import { createMoves } from "./createMoves"
import { GameState } from "./GameState"
import { Move } from "./Move"
import { makeSimulator } from "./Simulation"

export function makeSimpleSearch(gridWidth: number, gridHeight: number) {

   const simulator = makeSimulator(gridWidth, gridHeight)

   return function bestMove(state: GameState): Move {

      const moves = createMoves(state)

      const selectedMove = Math.floor(Math.random() * moves.length)

      // console.error("found ", moves.length, " moves - selected ", selectedMove + 1)
      // console.error(Move.toString(moves[selectedMove]))

      return moves[selectedMove]
   }
}