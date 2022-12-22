import { Action, createBuildActions, createMoveAndSpawnActions } from "./Action"
import { EPlayer, Turn } from "./Game"
import { readTurn } from "./input"
import { outputWait } from "./output"
import { orderBy, prefix } from "./Tools"

const initialInputs = readline().split(" ")
const gridWidth = parseInt(initialInputs[0])
const gridHeight = parseInt(initialInputs[1])

// noinspection InfiniteLoopJS
while (true) {

   let turn = readTurn(gridWidth, gridHeight)

   const { buildActionExecuted, buildOutput, buildTurn } =
      prefix(executeBuildActions(EPlayer.Me, turn), "build")

   const { moveAndSpawnActionExecuted, moveAndSpawnOutput } =
      prefix(executeMoveAndSpawnActions(EPlayer.Me, buildTurn), "moveAndSpawn")

   if (!buildActionExecuted && !moveAndSpawnActionExecuted) {
      console.log(outputWait())
   } else {
      console.log(buildOutput + moveAndSpawnOutput)
   }
}

function executeBuildActions(player: EPlayer, turn: Turn) {
   return executeActions(player, turn, createBuildActions(player, turn))
}

function executeMoveAndSpawnActions(player: EPlayer, turn: Turn) {
   return executeActions(player, turn, createMoveAndSpawnActions(player, turn))
}

function executeActions(player: EPlayer, turn: Turn, actions: Action[])
   : { output: string, turn: Turn, actionExecuted: boolean } {

   let actionExecuted = false

   const moveAndSpawnActions = orderBy(actions, action => action.score / action.cost).reverse()

   let matter = turn.player[player].matter

   let output = ""

   while (moveAndSpawnActions.length > 0) {

      const nextAction = moveAndSpawnActions.pop()

      if (nextAction.cost > matter) {
         continue
      }

      output += Action.execute(nextAction)
      matter -= nextAction.cost

      actionExecuted = true
   }

   return {
      output,
      turn: {
         ...turn,
         player: {
            ...turn.player,
            [player]: {
               ...turn.player[player],
               matter,
            },
         },
      },
      actionExecuted,
   }
}
