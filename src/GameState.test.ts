import * as fs from "fs"
import { BattleResult } from "./codingame/Types"
import { GameState } from "./GameState"
import { partition } from "./Tools"

describe("game state serialization", () => {

   const testCasesJSON = fs.readFileSync("./test/LastBattleResults.json").toString()

   const games = JSON.parse(testCasesJSON) as BattleResult[]

   describe.each(games)("is bijective", game => {

      const myIndex = game.agents.findIndex(agent => agent.codingamer.pseudo === "Gamli")

      if (myIndex === undefined) {
         throw new Error("Gamli not found")
      }

      const frames = game.frames.slice(1)

      const framePairs = partition(frames, 2)

      const testStates = framePairs.map(p0p1Frame => GameState.deserializeCompressed(p0p1Frame[myIndex].stderr))

      test.each(testStates)("for each state", testState => {
         const serialized = GameState.serializeCompressed(testState)
         const deserialized = GameState.deserializeCompressed(serialized)
         expect(deserialized).toEqual(testState)
      })
   })
}) 
