import { Action, BUILD_COSTS, BuildAction, MoveAction, SPAWN_COSTS, SpawnAction } from "./Action"
import { Cell, GameState, MY_PLAYER, Player } from "./GameState"
import { EPathCellType } from "./GraphSearch"
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

         const errors = validateBuildAction(player, action, state)
         if (errors.length) {
            if (player === MY_PLAYER) {
               throw new Error(errors.join("\n"))
            }
            return
         }

         let playerState = state.player[player]
         playerState.matter -= BUILD_COSTS
         playerState.recyclers++
         const cell = state.board.cell(action.pos)
         cell.recycler = true
         cell.canBuild = false
         cell.canSpawn = false
         state.board.iterateNeighbours(
            action.pos,
            neighbour => {
               neighbour.inRangeOfRecycler = true
            },
            true)
      })
   }

   function validateBuildAction(player: Player, action: BuildAction, state: GameState): string[] {

      const errMsgs = [] as string[]

      if (state.player[player].matter < BUILD_COSTS) {
         errMsgs.push(actionErrMsg("not enough mana", player, action, state))
      }

      if (!state.board.checkBounds(action.pos)) {
         errMsgs.push(actionErrMsg(
            `cell is out of bounds: ${JSON.stringify(action.pos)} - width=${state.board.width};height=${state.board.height}`,
            player,
            action,
            state))
      }

      const cell = state.board.cell(action.pos)

      if (cell.owner !== player) {
         errMsgs.push(actionErrMsg(`cell is not owned by player - owner: ${cell.owner}`, player, action, state))
      }

      if (cell.recycler) {
         errMsgs.push(actionErrMsg("there is already a recycler at position", player, action, state))
      }

      if (cell.units > 0) {
         errMsgs.push(actionErrMsg("there are units at position", player, action, state))
      }

      return errMsgs
   }

   function simulateMoveAndSpawnActions(move: Move, state: GameState) {

      const gridIdxCenter = { x: state.board.width / 2, y: state.board.height / 2 }

      iterateMoveActions(move, (player, action) => {

         const errors = assertMoveActionInvariants(player, action, state)
         if (errors.length) {
            if (player === MY_PLAYER) {
               throw new Error(errors.join("\n"))
            }
            return
         }

         const moveFrom = action.from
         let moveTo = action.to
         if (!GridIdx.isNeighbour(moveFrom, moveTo)) {

            let found = false

            let nearestToIdx = moveFrom
            let nearestToIdxManhattanDist = Infinity
            let nearestToCenterIdxEuclideanDist = Infinity

            state.board.bfs(
               moveFrom,
               (fromIdx, toIdx, _, predecessors) => {
                  if (GridIdx.equals(toIdx, moveTo)) {
                     predecessors.iteratePath(moveTo, (idx, type) => {
                        if (type === EPathCellType.PathCellIntermediate || type === EPathCellType.All) {
                           moveTo = idx
                           found = true
                           return false
                        }
                     })
                     return false
                  }

                  const toManhattanDist = GridIdx.manhattanDistance(toIdx, action.to)
                  const toCenterEuclideanDist = GridIdx.euclideanDistanceSquare(toIdx, gridIdxCenter)
                  if (toManhattanDist < nearestToIdxManhattanDist ||
                      (toManhattanDist === nearestToIdxManhattanDist &&
                       toCenterEuclideanDist < nearestToCenterIdxEuclideanDist)
                  ) {
                     nearestToIdx = toIdx
                     nearestToIdxManhattanDist = toManhattanDist
                     nearestToCenterIdxEuclideanDist = toCenterEuclideanDist
                  }

                  return true
               },
               Cell.isPath)

            if (!found) {
               state.board.bfs(
                  moveFrom,
                  (fromIdx, toIdx, _, predecessors) => {
                     if (GridIdx.equals(toIdx, nearestToIdx)) {
                        predecessors.iteratePath(nearestToIdx, (idx, type) => {
                           if (type === EPathCellType.PathCellIntermediate || type === EPathCellType.All) {
                              moveTo = idx
                              found = true
                              return false
                           }
                        })
                        return false
                     }
                     return true
                  },
                  Cell.isPath)
            }

            if (!found) {
               throw new Error("no path found")
            }
         }

         state.board.cell(moveFrom).units -= action.amount

         const toCell = state.board.cell(moveTo)

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

         const errors = assertSpawnActionInvariants(player, action, state)
         if (errors.length) {
            if (player === MY_PLAYER) {
               throw new Error(errors.join("\n"))
            }
            return
         }

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

   function assertMoveActionInvariants(player: Player, action: MoveAction, state: GameState): string[] {

      const errMsgs = [] as string[]

      const jsonFrom = JSON.stringify(action.from)
      const jsonTo = JSON.stringify(action.to)

      if (!state.board.checkBounds(action.from)) {
         errMsgs.push(actionErrMsg(
            `source cell is out of bounds: ${jsonFrom} - width=${state.board.width};height=${state.board.height}`,
            player,
            action,
            state))
      }

      if (!state.board.checkBounds(action.to)) {
         errMsgs.push(actionErrMsg(
            `target cell is out of bounds: ${jsonTo} - width=${state.board.width};height=${state.board.height}`,
            player,
            action,
            state))
      }

      if (GridIdx.equals(action.from, action.to)) {
         errMsgs.push(actionErrMsg(
            `cannot move from/to same cell: ${GridIdx.toString(action.from)}`,
            player,
            action,
            state))
      }

      const fromCell = state.board.cell(action.from)

      if (fromCell.owner !== player) {
         errMsgs.push(actionErrMsg(`cell is not owned by player - owner: ${fromCell.owner}`, player, action, state))
      }

      if (fromCell.units < action.amount) {
         errMsgs.push(actionErrMsg(
            `cell does not contain enough units: ${fromCell.units} < ${action.amount}`,
            player,
            action,
            state))
      }

      return errMsgs
   }

   function assertSpawnActionInvariants(player: Player, action: SpawnAction, state: GameState): string[] {

      const errMsgs = [] as string[]

      if (state.player[player].matter < SPAWN_COSTS) {
         errMsgs.push(actionErrMsg("not enough mana", player, action, state))
      }

      if (!state.board.checkBounds(action.pos)) {
         errMsgs.push(actionErrMsg(
            `cell is out of bounds: ${JSON.stringify(action.pos)} - width=${state.board.width};height=${state.board.height}`,
            player,
            action,
            state))
      }

      const cell = state.board.cell(action.pos)

      if (cell.owner !== player) {
         errMsgs.push(actionErrMsg(`cell is not owned by player - owner: ${cell.owner}`, player, action, state))
      }

      if (cell.scrap === 0) {
         errMsgs.push(actionErrMsg("cannot spawn on grass tiles", player, action, state))
      }

      return errMsgs
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
      state.board.iterate((cell, idx) => {
         if (cell.scrap === 0) {
            cell.owner = null
            if (cell.recycler) {
               state.board.iterateNeighbours(
                  idx,
                  neighbour => neighbour.recycler = false,
                  true)
            }
            cell.units = 0
         }
      })
   }

   return simulateMove
}

function actionErrMsg(message: string, player: Player, action: Action, state: GameState): string {
   const preamble = `Action Type: ${action.type} - Player: ${player}`
   const jsonAction = JSON.stringify(action)
   const jsonState = JSON.stringify(state)
   return [preamble, message, jsonAction, jsonState].join("\n")
}
