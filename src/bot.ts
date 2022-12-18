import { Action, createActions } from "./Action"
import { EPlayer } from "./Game"
import { readTurn } from "./input"
import { outputWait } from "./output"

const initialInputs = readline().split(" ")
const gridWidth = parseInt(initialInputs[0])
const gridHeight = parseInt(initialInputs[1])

// noinspection InfiniteLoopJS
while (true) {

   const turn = readTurn(gridWidth, gridHeight)

   const actions =
      createActions(EPlayer.Me, turn)
      .sort((a, b) => a.score / a.cost - b.score / b.cost)
      .reverse()

   let output = ""

   let matter = turn.player.Me.matter

   let actionExecuted = false

   while (actions.length > 0) {

      const nextAction = actions.pop()

      if (nextAction.cost > matter) {
         continue
      }

      output += Action.execute(nextAction)
      matter -= nextAction.cost

      actionExecuted = true
   }

   if (!actionExecuted) {
      output += outputWait()
   }

   console.log(output)
}

