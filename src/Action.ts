import { Board, Cell, EPlayer, Turn } from "./Game"
import { GridIdx } from "./Grid"
import { outputBuild, outputMove, outputSpawn, outputWait } from "./output"

export function createBuildActions(player: EPlayer, turn: Turn): Action[] {

   const actions: Action[] = []

   if (turn.player[player].recyclers < 2 && turn.player[player].matter >= 10) {
      const pos = recyclerPositionsWithScores(turn.board)[0]?.pos
      if (pos) {
         actions.push(buildAction(pos, 1))
      }
   }

   actions.push(...moves(player, turn.board))

   return actions
}

export function createMoveAndSpawnActions(player: EPlayer, turn: Turn): Action[] {

   const actions: Action[] = []

   actions.push(...moves(player, turn.board))
   actions.push(...spawns(player, turn))

   return actions
}

// TODO player - "canBuild" ist immer für Me
function recyclerPositionsWithScores(board: Board): { pos: GridIdx, score: number }[] {
   return board
   .flatten()
   .filter(({ cell: { canBuild, recycler } }) => canBuild && !recycler)
   .map(({ cell: buildCell, cellIdx: buildCellIdx }) => ({
      pos: buildCellIdx,
      score: board.sumNeighbours(
         buildCellIdx,
         cell => Math.min(cell.scrap, buildCell.scrap),
         true),
   }))
}

function moves(player: EPlayer, board: Board): MoveAction[] {
   return board
   .flatten()
   .filter(({ cell, cellIdx }) => cell.owner === player && cell.units > 0)
   .flatMap(({ cell, cellIdx }) => {
      const actions = [] as MoveAction[]
      const targets = unownedCells(player, board, cellIdx)
      if (targets.length > 0) {
         const unitsPerUnownedCell = Math.floor(cell.units / targets.length)
         let units = cell.units
         if (unitsPerUnownedCell > 0) {
            for (const target of targets) {
               actions.push(moveAction(unitsPerUnownedCell, cellIdx, target.cellIdx, target.score))
               units -= unitsPerUnownedCell
            }
         }
         if (units > 0) {
            actions.push(moveAction(units, cellIdx, targets[0].cellIdx, targets[0].score))
         }
      }
      
      return actions
   })
}

function spawns(player: EPlayer, turn: Turn): SpawnAction[] {

   const actions = [] as SpawnAction[]

   turn.board.iterate(
      (cell, idx) => {
         if (cell.owner === player && !cell.recycler) {
            const numberOfUnownedNeighbours =
               turn.board.sumNeighbours(
                  idx,
                  cell =>
                     cell.owner === EPlayer.opponent(player) || (!cell.owner && cell.scrap != 0)
                     ? 1
                     : 0)
            const sumOfDistancesToAllOtherBots =
               turn.board.sum(
                  (c, i) => {
                     if (c.owner === player && c.units > 0) {
                        return turn.board.bfsDist(
                           idx,
                           i,
                           cell => (!!cell.owner || cell.scrap > 0) && !cell.recycler)
                     } else {
                        return 0
                     }
                  })
            actions.push(spawnAction(1, idx, numberOfUnownedNeighbours))
         }
      })

   return actions
}

function unownedCells(player: EPlayer, board: Board, pos: GridIdx) {
   const cells = [] as { cellIdx: GridIdx, enemyUnits: number, score: number }[]
   board.bfs(
      pos,
      (_, cellIdx, distance) => {
         const cell = board.cell(cellIdx)
         if (cell.owner !== player && cell.scrap > 0) {
            cells.push({ cellIdx, enemyUnits: cell.units, score: 2 - distance })
         }
         //return distance < 2
         return true
      },
      Cell.isPath)
   return cells
}

export module Action {
   export function execute(action: Action): string {
      switch (action.type) {
         case EAction.Wait:
            return outputWait()
         case EAction.Move:
            return outputMove(action.amount, action.from, action.to)
         case EAction.Build:
            return outputBuild(action.pos)
         case EAction.Spawn:
            return outputSpawn(action.amount, action.pos)
      }
   }
}

export type Action = MoveAction | BuildAction | SpawnAction | WaitAction

export interface MoveAction extends ActionBase {
   type: EAction.Move
   amount: number
   from: GridIdx
   to: GridIdx
}

const moveAction = (amount: number, from: GridIdx, to: GridIdx, score: number): MoveAction => ({
   type: EAction.Move,
   score,
   cost: 0,
   amount,
   from,
   to,
})

export interface BuildAction extends ActionBase {
   type: EAction.Build
   pos: GridIdx
}

const buildAction = (pos: GridIdx, score: number): BuildAction => ({
   type: EAction.Build,
   score,
   cost: 10,
   pos,
})

export interface SpawnAction extends ActionBase {
   type: EAction.Spawn
   amount: number
   pos: GridIdx
}

const spawnAction = (amount: number, pos: GridIdx, score: number): SpawnAction => ({
   type: EAction.Spawn,
   score,
   cost: 10,
   amount,
   pos,
})

export interface WaitAction extends ActionBase {
   type: EAction.Wait
}

const waitAction = (score: number): WaitAction => ({
   type: EAction.Wait,
   score,
   cost: 0,
})

export interface ActionBase {
   type: EAction
   score: number
   cost: number
}

export enum EAction {
   Move = "MOVE",
   Build = "BUILD",
   Spawn = "SPAWN",
   Wait = "WAIT",
}

