import { Action, BUILD_COSTS, BuildAction, EAction, MoveAction, SPAWN_COSTS, SpawnAction } from "./Action"
import { GameState, Player } from "./GameState"
import { Grid, GridIdx } from "./Grid"
import { Move } from "./Move"
import iterateBuildActions = Move.iterateBuildActions
import iterateMoveActions = Move.iterateMoveActions
import iterateSpawnActions = Move.iterateSpawnActions

export function makeSimulator(width: number, height: number) {

   function simulateMove(move: Move, state: GameState): GameState {

      const nextState = GameState.clone(state)
      nextState.turn = state.turn + 1

      simulateBuildActions(move, nextState)
      simulateMoveAndSpawnActions(move, nextState)
      simulateRecyclers(nextState)
      simulateDeadlyGrass(nextState)

      nextState.player[0].matter += 10
      nextState.player[1].matter += 10

      return nextState
   }

   function simulateBuildActions(move: Move, state: GameState): void {

      iterateBuildActions(move, (player, action) => {

         assertBuildActionInvariants(player, action, state)

         state.player[player].matter -= BUILD_COSTS
         state.board.cell(action.pos).recycler = true
      })
   }

   function assertBuildActionInvariants(player: Player, action: BuildAction, state: GameState) {

      if (state.player[player].matter < BUILD_COSTS) {
         actionException("not enough mana", player, action, state)
      }

      if (!state.board.checkBounds(action.pos)) {
         actionException(
            `cell is out of bounds: ${JSON.stringify(action.pos)} - width=${state.board.width};height=${state.board.height}`,
            player,
            action,
            state)
      }

      const cell = state.board.cell(action.pos)

      if (cell.owner !== player) {
         actionException(`cell is not owned by player - owner: ${cell.owner}`, player, action, state)
      }

      if (cell.recycler) {
         actionException("there is already a recycler at position", player, action, state)
      }

      if (cell.units > 0) {
         actionException("there are units at position", player, action, state)
      }
   }

   function simulateMoveAndSpawnActions(move: Move, state: GameState) {

      iterateMoveActions(move, (player, action) => {

         assertMoveActionInvariants(player, action, state)

         state.board.cell(action.from).units -= action.amount

         const toCell = state.board.cell(action.to)

         if (toCell.recycler) {
            return
         }

         switch (toCell.owner) {
            case null:
               toCell.owner = player
               toCell.units += action.amount
               break
            case player:
               toCell.units += action.amount
               break
            default:
               if (action.amount > toCell.units) {
                  toCell.owner = player
                  toCell.units = action.amount - toCell.units
               } else {
                  toCell.units -= action.amount
               }
         }
      })

      iterateSpawnActions(move, (player, action) => {

         assertSpawnActionInvariants(player, action, state)

         const pos = state.board.cell(action.pos)

         if (pos.recycler) {
            return
         }

         switch (pos.owner) {
            case null:
               pos.owner = player
               pos.units += action.amount
               break
            case player:
               pos.units += action.amount
               break
            default:
               if (action.amount > pos.units) {
                  pos.owner = player
                  pos.units = action.amount - pos.units
               } else {
                  pos.units -= action.amount
               }
         }
      })


   }

   function assertMoveActionInvariants(player: Player, action: MoveAction, state: GameState) {

      const jsonFrom = JSON.stringify(action.from)
      const jsonTo = JSON.stringify(action.to)

      if (!state.board.checkBounds(action.from)) {
         actionException(
            `source cell is out of bounds: ${jsonFrom} - width=${state.board.width};height=${state.board.height}`,
            player,
            action,
            state)
      }

      if (!state.board.checkBounds(action.to)) {
         actionException(
            `target cell is out of bounds: ${jsonTo} - width=${state.board.width};height=${state.board.height}`,
            player,
            action,
            state)
      }

      const fromCell = state.board.cell(action.from)
      const toCell = state.board.cell(action.to)

      if (fromCell.owner !== player) {
         actionException(`cell is not owned by player - owner: ${fromCell.owner}`, player, action, state)
      }

      if (fromCell.units < action.amount) {
         actionException(
            `cell does not contain enough units: ${fromCell.units} < ${action.amount}`,
            player,
            action,
            state)
      }

      if (!GridIdx.isNeighbour(action.from, action.to)) {
         actionException(
            `can only move to direct neighbour cells: ${jsonFrom} - ${jsonTo}`,
            player,
            action,
            state)
      }

      if (toCell.scrap === 0) {
         actionException("cannot move onto grass tile", player, action, state)
      }
   }

   function assertSpawnActionInvariants(player: Player, action: SpawnAction, state: GameState) {

      if (state.player[player].matter < SPAWN_COSTS) {
         actionException("not enough mana", player, action, state)
      }

      if (!state.board.checkBounds(action.pos)) {
         actionException(
            `cell is out of bounds: ${JSON.stringify(action.pos)} - width=${state.board.width};height=${state.board.height}`,
            player,
            action,
            state)
      }

      const cell = state.board.cell(action.pos)

      if (cell.owner !== player) {
         actionException(`cell is not owned by player - owner: ${cell.owner}`, player, action, state)
      }

      if (cell.scrap === 0) {
         actionException("cannot spawn on grass tiles", player, action, state)
      }
   }

   const recyclerMarkers = new Grid<[number, number]>(width, height, () => [0, 0])

   function simulateRecyclers(state: GameState) {

      const turn = state.turn

      state.board.iterateRecyclers(recyclerIdx => {
         const recyclerOwner = state.board.cell(recyclerIdx).owner
         state.board.iterateNeighbours(
            recyclerIdx,
            (neighbour, neighbourIdx) => {
               if (neighbour.scrap === 0) {
                  return
               }
               const markerCell = recyclerMarkers.cell(neighbourIdx)
               if (markerCell[recyclerOwner] < turn) {
                  markerCell[recyclerOwner] = turn
                  state.player[recyclerOwner].matter++
                  const opponent = Player.opponent(recyclerOwner)
                  if (markerCell[opponent] < turn) {
                     neighbour.scrap--
                  }
               }
            },
            true)
      })
   }

   function simulateDeadlyGrass(state: GameState) {
      state.board.iterate(cell => {
         if (cell.scrap === 0) {
            cell.recycler = false
            cell.units = 0
         }
      })
   }

   return simulateMove
}

function actionException(message: string, player: Player, action: Action, state: GameState) {
   const preamble = `Action Type: ${action.type} - Player: ${player}`
   const jsonAction = JSON.stringify(action)
   const jsonState = JSON.stringify(state)
   throw new Error([preamble, message, jsonAction, jsonState].join("\n"))
}
