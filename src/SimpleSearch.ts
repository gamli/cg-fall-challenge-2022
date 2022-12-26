import { createMoves } from "./createMoves"
import { GameState, Player } from "./GameState"
import { Move } from "./Move"
import { makeSimulator } from "./Simulation"

export function makeSimpleSearch(gridWidth: number, gridHeight: number) {

   const simulator = makeSimulator(gridWidth, gridHeight)

   return function bestMove(state: GameState): Move {
      
      const moves = createMoves(state)
      
      return moves[0]
   }
}