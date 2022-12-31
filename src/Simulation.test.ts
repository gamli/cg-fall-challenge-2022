import * as fs from "fs"
import { BattleResult } from "./codingame/Types"
import { GameState, MY_PLAYER } from "./GameState"
import { Move, PlayerMove } from "./Move"
import { makeSimulator } from "./Simulation"
import { partition } from "./Tools"

describe("simulation", () => {

   const testCasesJSON = fs.readFileSync("./test/LastBattleResults.json").toString()

   const games = JSON.parse(testCasesJSON) as BattleResult[]

   describe.each(games)("produces the same state as the referee for each game", game => {

      const gamliIdx = game.agents.findIndex(agent => agent.codingamer.pseudo === "Gamli")

      if (gamliIdx === undefined) {
         throw new Error("Gamli not found")
      }

      const frames = game.frames.slice(1)

      const framePairs = partition(frames, 2)

      if (gamliIdx !== MY_PLAYER) {
         for (const framePair of framePairs) {
            framePair.reverse()
         }
      }

      const statesAndMoves =
         framePairs.map(p0p1Frame => {
            const state = GameState.deserializeCompressed(p0p1Frame[MY_PLAYER].stderr)
            const move = p0p1Frame.map(frame => BattleResult.Frame.playerMove(frame)) as [PlayerMove, PlayerMove]
            return {
               state,
               move,
            }
         })

      const testCases = [] as { game: BattleResult, stateBeforeMove: GameState, move: Move, stateAfterMove: GameState }[]
      for (let i = 0; i < statesAndMoves.length - 1; i++) {
         const { state: stateBeforeMove, move } = statesAndMoves[i]
         const { state: stateAfterMove } = statesAndMoves[i + 1]
         testCases.push({
            game,
            stateBeforeMove,
            move,
            stateAfterMove,
         })
      }

      test.each(testCases)("and each turn", testCase => {

         const board = testCase.stateBeforeMove.board
         const simulator = makeSimulator(board.width, board.height)

         const stateAfterSimulatedMove = simulator(testCase.move, testCase.stateBeforeMove)

         expect(stateAfterSimulatedMove).toEqual(testCase.stateAfterMove)
      })
   })
}) 
