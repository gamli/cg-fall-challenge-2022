import { Action, BuildAction, EAction, InferAction, MoveAction, SpawnAction, WaitAction } from "./Action"
import { Player } from "./GameState"

export type Move = readonly [PlayerMove, PlayerMove]

export type PlayerMove = readonly Action[]

export module Move {

   export function iterateMoveActions(move: Move, handler: (player: Player, action: MoveAction) => void) {
      return iterateActionsOfType(move, EAction.Move, handler)
   }

   export function iterateBuildActions(move: Move, handler: (player: Player, action: BuildAction) => void) {
      return iterateActionsOfType(move, EAction.Build, handler)
   }

   export function iterateSpawnActions(move: Move, handler: (player: Player, action: SpawnAction) => void) {
      return iterateActionsOfType(move, EAction.Spawn, handler)
   }

   export function iterateWaitActions(move: Move, handler: (player: Player, action: WaitAction) => void) {
      return iterateActionsOfType(move, EAction.Wait, handler)
   }

   export function iterateActionsOfType<TEAction extends EAction>(
      move: Move,
      actionType: TEAction,
      handler: (player: Player, action: InferAction<TEAction>) => void,
   ) {
      for (let player = 0; player <= 1; player++) {
         const playerMove = move[player]
         for (let i = 0; i < playerMove.length; i++) {
            const action = playerMove[i]
            if (action.type === actionType) {
               handler(player as Player, action as InferAction<TEAction>)
            }
         }
      }
   }
}