import { BUILD_COSTS, buildAction, moveAction, MoveAction, SPAWN_COSTS, spawnAction } from "./Action"
import { Cell, GameState, Player } from "./GameState"
import { EPathCellType } from "./GraphSearch"
import { GridIdx } from "./Grid"
import { Move, PlayerMove } from "./Move"
import { orderBy } from "./Tools"

export function createMoves(state: GameState): Move[] {

   const firstPlayerMoves = createPlayerMoves(state, 0)
   const secondPlayerMoves = createPlayerMoves(state, 1)

   const moves =
      firstPlayerMoves.flatMap(
         firstPlayerMove => secondPlayerMoves.map(
            secondPlayerMove => [firstPlayerMove, secondPlayerMove])) as Move[]

   return moves
}

function createPlayerMoves(state: GameState, player: Player): PlayerMove[] {

   const playerState = state.player[player]

   const playerMovesAndMatter = [[[], playerState.matter]] as PlayerMoveAndMatter[]

   addRecyclerActions(state, player, playerMovesAndMatter)
   addSpawnActions(state, player, playerMovesAndMatter)
   addMoveActionSets(state, player, playerMovesAndMatter)

   const playerMoves = playerMovesAndMatter.map(([playerMove]) => playerMove)

   return playerMoves
}

function addRecyclerActions(state: GameState, player: Player, playerMovesAndMatter: PlayerMoveAndMatter[]) {

   // console.error("creating recycler actions", playerMovesAndMatter)

   const recyclerPositions = potentialRecyclerBuildPositions(state, player)
   let playerState = state.player[player]
   if (playerState.matter >= BUILD_COSTS) {
      for (const recyclerPosition of recyclerPositions) {
         playerMovesAndMatter.push([[buildAction(recyclerPosition)], playerState.matter - BUILD_COSTS])
      }
   }

   // console.error("\tdone: created recycler actions", playerMovesAndMatter)
}

function potentialRecyclerBuildPositions(state: GameState, player: Player): GridIdx[] {

   const positionsWithScores = [] as [GridIdx, number][]

   if (state.player[player].recyclers < 2) {

      state.board.iterate((buildCell, buildCellIdx) => {

         if (buildCell.owner === player && !buildCell.recycler && buildCell.units === 0) {

            const totalScrap =
               state.board.sumNeighbours(
                  buildCellIdx,
                  cell => Math.min(cell.scrap, buildCell.scrap),
                  true)

            if (totalScrap > BUILD_COSTS) { // TODO nur wenn gutes Stück größer?!?
               positionsWithScores.push([buildCellIdx, totalScrap])
            }
         }
      })
   }

   return orderBy(positionsWithScores, positionWithScore => -positionWithScore[1])
   .slice(0, 3)
   .map(([pos]) => pos)
}

function addSpawnActions(state: GameState, player: Player, playerMovesAndMatter: PlayerMoveAndMatter[]) {

   // console.error("creating spawn actions", playerMovesAndMatter)

   const spawnPositions = potentialSpawnPositions(state, player)
   const movesWithSpawnActionsAdded = [] as typeof playerMovesAndMatter
   const numberOfMovesWithoutSpawnActions = playerMovesAndMatter.length
   for (let numberOfSpawns = 1; numberOfSpawns <= spawnPositions.length; numberOfSpawns++) {

      const spawnActions =
         spawnPositions
         .slice(0, numberOfSpawns)
         .map(spawnPosition => spawnAction(1, spawnPosition))
      const totalSpawnCosts = spawnActions.length * SPAWN_COSTS

      for (let i = 0; i < numberOfMovesWithoutSpawnActions; i++) {
         const moveWithoutSpawnActions = playerMovesAndMatter[i]
         const matterLeft = moveWithoutSpawnActions[1]
         if (matterLeft >= totalSpawnCosts) {
            movesWithSpawnActionsAdded.push([
               [...moveWithoutSpawnActions[0], ...spawnActions],
               matterLeft - totalSpawnCosts,
            ])
         }
      }
   }
   playerMovesAndMatter.push(...movesWithSpawnActionsAdded)

   // console.error("\tdone: created spawn actions", playerMovesAndMatter)
}

function potentialSpawnPositions(state: GameState, player: Player): GridIdx[] {

   const positionsWithScores = [] as [GridIdx, number][]

   state.board.iterate((spawnCell, spawnCellIdx) => {

      if (spawnCell.owner === player && !spawnCell.recycler) {

         const totalUnownedCells =
            state.board.sumNeighbours(
               spawnCellIdx,
               cell => cell.owner !== player && cell.scrap > 0 && !cell.recycler ? 1 : 0,
               true)

         if (totalUnownedCells > 0) {
            positionsWithScores.push([spawnCellIdx, totalUnownedCells])
         }
      }
   })

   return orderBy(positionsWithScores, positionWithScore => -positionWithScore[1])
   .slice(0, 3)
   .map(([pos]) => pos)
}

function addMoveActionSets(state: GameState, player: Player, playerMovesAndMatter: PlayerMoveAndMatter[]) {

   // console.error("creating move action sets", playerMovesAndMatter)

   const moveActionSets = potentialMoveActionSets(state, player)
   const numberOfMovesWithoutMoveActions = playerMovesAndMatter.length
   for (const moveActionSet of moveActionSets) {
      for (let i = 0; i < numberOfMovesWithoutMoveActions; i++) {
         const playerMove = playerMovesAndMatter[i]
         playerMovesAndMatter.push([[...playerMove[0], ...moveActionSet], playerMove[1]])
      }
   }

   // console.error("\tdone: created move action sets", playerMovesAndMatter)
}

function potentialMoveActionSets(state: GameState, player: Player): MoveAction[][] {

   const moveActionSets = [[]] as MoveAction[][]
   const moveActionSet = moveActionSets[0]

   state.board.iterate((cellWithUnits, cellWithUnitsIdx) => {

      if (cellWithUnits.owner === player && cellWithUnits.units > 0) {

         let unitsLeftToMove = cellWithUnits.units

         state.board.iterateNeighbours(cellWithUnitsIdx, (neighbour, neighbourIdx) => {
            if (Cell.isPath(neighbour) // can we even move to the cell
                && neighbour.owner !== cellWithUnits.owner // do we not own the cell already
                && neighbour.units < unitsLeftToMove // can we claim the cell
            ) {
               // move as many bots as necessary to claim the cell
               let amount = neighbour.units + 1
               moveActionSet.push(moveAction(amount, cellWithUnitsIdx, neighbourIdx))
               unitsLeftToMove -= amount
            }
         })

         if (unitsLeftToMove > 0) {
            state.board.bfs(
               cellWithUnitsIdx,
               (_fromIdx, toIdx, _depth, predecessors) => {
                  const toCell = state.board.cell(toIdx)
                  if (toCell.owner !== cellWithUnits.owner // do we not own the cell already
                      && toCell.units < unitsLeftToMove // can we claim the cell
                  ) {
                     predecessors.iteratePath(toIdx, (pathIdx, cellPathType) => {
                        // take first step towards target cell as action target
                        if (cellPathType === EPathCellType.PathCellIntermediate) {
                           moveActionSet.push(moveAction(1, cellWithUnitsIdx, pathIdx))
                           unitsLeftToMove--
                           return false
                        }
                     })
                     if (unitsLeftToMove === 0) {
                        return false
                     }
                  }
                  return true
               },
               Cell.isPath)
         }
      }
   })

   return moveActionSets
}


type PlayerMoveAndMatter = [PlayerMove, number]

// function canCaptureCell(fromCell: Cell, toCell: Cell) {
//    return toCell.owner !== fromCell.owner && !toCell.recycler && toCell.units < fromCell.units
// }

// function createBuildActions(player: Player, gameState: GameState): Action[] {
//
//    const actions: Action[] = []
//
//    if (gameState.player[player].recyclers < 2 && gameState.player[player].matter >= 10) {
//       const pos = recyclerPositionsWithScores(gameState.board)[0]?.pos
//       if (pos) {
//          actions.push(buildAction(pos))
//       }
//    }
//
//    actions.push(...moves(player, gameState.board))
//
//    return actions
// }
//
// function createMoveAndSpawnActions(player: Player, gameState: GameState): Action[] {
//
//    const actions: Action[] = []
//
//    actions.push(...moves(player, gameState.board))
//    actions.push(...spawns(player, gameState))
//
//    return actions
// }
//
// // TODO player - "canBuild" ist immer für Me
// function recyclerPositionsWithScores(board: Board): { pos: GridIdx, score: number }[] {
//    return board
//    .flatten()
//    .filter(({ cell: { canBuild, recycler } }) => canBuild && !recycler)
//    .map(({ cell: buildCell, cellIdx: buildCellIdx }) => ({
//       pos: buildCellIdx,
//       score: board.sumNeighbours(
//          buildCellIdx,
//          cell => Math.min(cell.scrap, buildCell.scrap),
//          true),
//    }))
// }
//
// function moves(player: Player, board: Board): MoveAction[] {
//    return board
//    .flatten()
//    .filter(({ cell, cellIdx }) => cell.owner === player && cell.units > 0)
//    .flatMap(({ cell, cellIdx }) => {
//       const actions = [] as MoveAction[]
//       const targets = unownedCells(player, board, cellIdx)
//       if (targets.length > 0) {
//          const unitsPerUnownedCell = Math.floor(cell.units / targets.length)
//          let units = cell.units
//          if (unitsPerUnownedCell > 0) {
//             for (const target of targets) {
//                actions.push(moveAction(unitsPerUnownedCell, cellIdx, target.cellIdx))
//                units -= unitsPerUnownedCell
//             }
//          }
//          if (units > 0) {
//             actions.push(moveAction(units, cellIdx, targets[0].cellIdx))
//          }
//       }
//
//       return actions
//    })
// }
//
// function spawns(player: Player, gameState: GameState): SpawnAction[] {
//
//    const actions = [] as SpawnAction[]
//
//    gameState.board.iterate(
//       (cell, idx) => {
//          if (cell.owner === player && !cell.recycler) {
//             const numberOfUnownedNeighbours =
//                gameState.board.sumNeighbours(
//                   idx,
//                   cell =>
//                      cell.owner === Player.opponent(player) || (!cell.owner && cell.scrap != 0)
//                      ? 1
//                      : 0)
//             const sumOfDistancesToAllOtherBots =
//                gameState.board.sum(
//                   (c, i) => {
//                      if (c.owner === player && c.units > 0) {
//                         return gameState.board.bfsDist(
//                            idx,
//                            i,
//                            cell => (!!cell.owner || cell.scrap > 0) && !cell.recycler)
//                      } else {
//                         return 0
//                      }
//                   })
//             actions.push(spawnAction(1, idx))
//          }
//       })
//
//    return actions
// }
//
// function unownedCells(player: Player, board: Board, pos: GridIdx) {
//    const cells = [] as { cellIdx: GridIdx, enemyUnits: number }[]
//    board.bfs(
//       pos,
//       (_, cellIdx, distance) => {
//          const cell = board.cell(cellIdx)
//          if (cell.owner !== player && cell.scrap > 0) {
//             cells.push({ cellIdx, enemyUnits: cell.units })
//          }
//          //return distance < 2
//          return true
//       },
//       Cell.isPath)
//    return cells
// }