

/**
 * Auto-generated code below aims at helping you parse
 * the standard input according to the problem statement.
 **/

const initialInputs = readline().split(" ");
const gridWidth = parseInt(initialInputs[0]);
const gridHeight = parseInt(initialInputs[1]);
const gridDimensions: Dimensions = {width: gridWidth, height: gridHeight}

function createActions(turn: Turn): Action[] {

   const actions: Action[] = []

   const brp = bestRecyclerPosition(turn.grid)
   if (brp) {
      actions.push({
         type: EAction.Build,
         execute: () => outputBuild(brp),
         cost: 10,
         score: 1,
      })
   }

   return actions
}

function bestRecyclerPosition(grid: Grid): Pos {
   return maxGrid(
      grid,
      (cell, pos) =>
         cell.canBuild ? sumNeighbours(grid, pos, cell => cell.scrap) : -1)
}

function maxGrid(grid: Grid, selector: (cell: Cell, pos: Pos) => number): Pos {
   return minGrid(grid, (cell, pos) => -selector(cell, pos))
}

function minGrid(grid: Grid, selector: (cell: Cell, pos: Pos) => number): Pos {
   return reduceGrid(
      grid,
      (acc, cell, pos) => {
         const selected = selector(cell, pos)
         if (selected >= acc[0]) {
            return acc
         }
         return [selected, pos] as const
      },
      [Number.MAX_VALUE, undefined as unknown as Pos] as const)[1]
}

function reduceGrid<TAcc>(grid: Grid, reducer: (acc: TAcc, cell: Cell, pos: Pos) => TAcc, initial: TAcc) {
   let acc = initial
   iterateGrid(grid, (cell, pos) => acc = reducer(acc, cell, pos))
   return acc
}

function iterateGrid(grid: Grid, handleCell: (cell: Cell, pos: Pos) => void) {
   for (let x = 0; x < grid.dimensions.width; x++) {
      for (let y = 0; y < grid.dimensions.height; y++) {
         const pos = {x, y}
         handleCell(grid.cell(pos), pos)
      }
   }
}

function sumNeighbours(grid: Grid, pos: Pos, selector: (cell: Cell, pos: Pos) => number) {
   return reduceNeighbours(
      grid,
      pos,
      (sum, neighbour, p) => sum + selector(neighbour, p),
      0)
}

function reduceNeighbours<TAcc>(
   grid: Grid,
   pos: Pos,
   reducer: (acc: TAcc, neighbour: Cell, pos: Pos) => TAcc,
   initial: TAcc,
): TAcc {

   let acc = initial

   iterateNeighbours(grid, pos, (neighbour, pos) => acc = reducer(acc, neighbour, pos))

   return acc
}

function iterateNeighbours(
   grid: Grid,
   pos: Pos,
   handleNeighbour: (neighbour: Cell, pos: Pos) => void,
) {
   for (const [neighbour, p] of neighbourPoss(pos).map(pos => [grid.cell(pos), pos] as const).filter(([cell]) => !!cell)) {
      handleNeighbour(neighbour, p)
   }
}

function neighbourPoss(pos: Pos) {
   return [
      pos,
      posOffset(pos, {x: -1}),
      posOffset(pos, {x: 1}),
      posOffset(pos, {y: -1}),
      posOffset(pos, {y: 1}),
   ]
}

type Action = {
   type: EAction
   score: number
   cost: number
   execute: () => void
}

function outputMove(amount: number, from: Pos, to: Pos) {
   console.log(EAction.Move, amount, toStringPos(from), toStringPos(to))
}

function outputBuild(pos: Pos) {
   console.log(EAction.Build, toStringPos(pos))
}

function outputSpawn(amount: number, pos: Pos) {
   console.log(EAction.Spawn, amount, toStringPos(pos))
}

function outputWait() {
   console.log(EAction.Wait)
}

function outputMessage(message: string) {
   console.log("MESSAGE", message)
}

function toStringPos(pos: Pos): string {
   return pos.x + " " + pos.y
}

function readTurn(dimensions: Dimensions): Turn {

   const inputs = readline().split(" ")

   return {
      matter: {
         Me: parseInt(inputs[0]),
         Opp: parseInt(inputs[1])
      },
      grid: readGrid(dimensions),
   }
}

function readGrid(dimensions: Dimensions): Grid {

   const grid: Grid = {
      dimensions,
      cells: [],
      cell: ({x, y}) => grid.cells[y]?.[x],
   }

   for (let i = 0; i < gridHeight; i++) {
      grid.cells.push([])
      for (let j = 0; j < gridWidth; j++) {
         grid.cells[i].push(readCell())
      }
   }

   return grid
}

function readCell(): Cell {
   const [scrap, owner, units, recycler, canBuild, canSpawn, inRangeOfRecycler] = readline().split(" ")
   return {
      scrap: parseInt(scrap),
      owner: parseOwner(owner),
      units: parseInt(units),
      recycler: recycler === "1",
      inRangeOfRecycler: inRangeOfRecycler === "1",
      canBuild: canBuild === "1",
      canSpawn: canSpawn === "1",
   }
}

function parseOwner(input: string): EPlayer | null {
   const owner = parseInt(input)
   return owner === 1 ? EPlayer.Me : owner === 0 ? EPlayer.Opp : null
}

enum EAction {
   Move = "MOVE",
   Build = "BUILD",
   Spawn = "SPAWN",
   Wait = "WAIT",
}

type Turn = {
   matter: {
      [EPlayer.Me]: number
      [EPlayer.Opp]: number
   }
   grid: Grid
}

type Grid = {
   dimensions: Dimensions
   cells: Cell[][]
   cell: (pos: Pos) => Cell
}

type Dimensions = {
   width: number
   height: number
}

function posOffset(pos: Pos, offset: { x?: number, y?: number }): Pos {
   return {
      x: pos.x + (offset.x || 0),
      y: pos.y + (offset.y || 0),
   }
}

type Pos = {
   x: number
   y: number
}

type Cell = {
   scrap: number
   owner: EPlayer | null
   units: number
   recycler: boolean
   inRangeOfRecycler: boolean
   canBuild: boolean
   canSpawn: boolean
}

enum EPlayer {
   Me = "Me",
   Opp = "Opp",
}


// game loop
while (true) {

   const turn = readTurn(gridDimensions)

   const actions = createActions(turn).sort((a, b) => a.score - b.score)

   let matter = turn.matter.Me

   let actionExecuted = false

   while (true) {

      const affordableActions = actions.filter(action => action.cost <= matter)

      if (affordableActions.length === 0) {
         break
      }

      const nextAction = affordableActions[0]

      nextAction.execute()

      actionExecuted = true
   }

   if (!actionExecuted) {
      outputWait()
   }
}

