import * as fs from "fs"
import { BattleResult } from "./codingame/Types"
import { GameState } from "./GameState"
import { Move, PlayerMove } from "./Move"
import { makeSimulator } from "./Simulation"
import { partition } from "./Tools"

describe("simulation", () => {

   const testCasesJSON = fs.readFileSync("./test/LastBattleResults.json").toString()

   const games = JSON.parse(testCasesJSON) as BattleResult[]

   describe.each(games)("produces the same state as the referee for each game", game => {

      const myIndex = game.agents.findIndex(agent => agent.codingamer.pseudo === "Gamli")

      if (!myIndex) {
         throw new Error("Gamli not found")
      }

      const frames = game.frames.slice(1)

      const framePairs = partition(frames, 2)

      let gridWidth: number
      let gridHeight: number

      const statesAndMoves =
         framePairs.map((p0p1Frame, turnIdx) => {

            const state = GameState.deserializeCompressed(p0p1Frame[myIndex].stderr)
            const move = p0p1Frame.map(frame => BattleResult.Frame.playerMove(frame)) as [PlayerMove, PlayerMove]

            return {
               state,
               move,
            }
         })

      const testCases = [] as { stateBeforeMove: GameState, move: Move, stateAfterMove: GameState }[]
      for (let i = 0; i < statesAndMoves.length - 1; i++) {
         const { state: stateBeforeMove, move } = statesAndMoves[i]
         const { state: stateAfterMove } = statesAndMoves[i + 1]
         testCases.push({
            stateBeforeMove,
            move,
            stateAfterMove,
         })
      }

      test.each(testCases)("and each turn", testCase => {

         const simulator = makeSimulator(gridWidth, gridHeight)

         const stateAfterSimulatedMove = simulator(testCase.move, testCase.stateBeforeMove)

         expect(stateAfterSimulatedMove).toEqual(testCase.stateAfterMove)
      })
   })
}) 
