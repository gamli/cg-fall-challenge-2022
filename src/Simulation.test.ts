import * as fs from "fs"
import { BattleResult } from "./codingame/Types"
import { GameState } from "./GameState"
import { readGameState } from "./input"
import { Move, PlayerMove } from "./Move"
import { makeSimulator } from "./Simulation"
import { partition } from "./Tools"
import Frame = BattleResult.Frame

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

            try {
               extractStateFromFrame(p0p1Frame[myIndex], turnIdx)
            } catch (e) {
               console.log(e)
            }

            const state = extractStateFromFrame(p0p1Frame[myIndex], turnIdx)
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

      function extractStateFromFrame(frame: Frame, turnIdx: number) {

         let lines: string[]

         if (turnIdx === 0) {
            lines = frame.stderr.split("\n")
            const wh = lines[0].split(" ").map(s => parseInt(s))
            gridWidth = wh[0]
            gridHeight = wh[1]
            lines.splice(0, 1)
         } else {
            lines = frame.stderr.split("\n")
         }

         let lineIdx = 0
         const readline = () => {
            if (lineIdx >= lines.length) {
               throw new Error("index out of bounds: " + lineIdx + " vs " + lines.length)
            }
            const line = lines[lineIdx]
            lineIdx++
            return line
         }

         return readGameState(gridWidth, gridHeight, turnIdx + 1, readline)
      }

      test.each(testCases)("and each turn", testCase => {

         const simulator = makeSimulator(gridWidth, gridHeight)

         const stateAfterSimulatedMove = simulator(testCase.move, testCase.stateBeforeMove)

         expect(stateAfterSimulatedMove).toEqual(testCase.stateAfterMove)
      })
   })
}) 
