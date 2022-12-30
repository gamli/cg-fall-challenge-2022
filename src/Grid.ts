import { bfs, bfsDist, BfsVisitor } from "./Bfs"
import { dijkstra, dijkstraDist, DijkstraVisitor } from "./Dijkstra"
import { deserializeNumber, serializeNumber } from "./Tools"

export class Grid<TCell> {

   private readonly _data: TCell[][]

   constructor(
      public readonly width: number,
      public readonly height: number,
      defaultCell: TCell | ((idx: GridIdx) => TCell),
   ) {

      const createDefaultCell = typeof defaultCell === "function" ? defaultCell : () => defaultCell

      this._data = []
      for (let y = 0; y < height; y++) {
         const row = []
         for (let x = 0; x < width; x++) {
            let cellIdx = { x, y }
            let cell = (createDefaultCell as ((idx: GridIdx) => TCell))(cellIdx)
            row.push(cell)
         }
         this._data.push(row)
      }
   }

   cell({ x, y }: GridIdx) {
      return this._data[y]?.[x]
   }

   setCell(idx: GridIdx, value: TCell) {
      this._data[idx.y][idx.x] = value
   }

   setAllCells(value: TCell) {
      for (let i = 0; i < this._data.length; i++) {
         this._data[i].fill(value)
      }
   }

   checkBounds(idx: GridIdx) {
      return idx.x >= 0 && idx.x < this.width && idx.y >= 0 && idx.y < this.height
   }

   flatten() {
      const flattened = [] as { cell: TCell, cellIdx: GridIdx }[]
      this.iterate((cell, cellIdx) => flattened.push({ cell, cellIdx }))
      return flattened
   }

   map<TSelectedCell>(selector: (cell: TCell, gridIdx: GridIdx) => TSelectedCell): Grid<TSelectedCell> {
      return new Grid(
         this.width,
         this.height,
         idx => selector(this.cell(idx), idx))
   }

   max(selector: (cell: TCell, gridIdx: GridIdx) => number): GridIdx {
      return this.min((cell, gridIdx) => -selector(cell, gridIdx))
   }

   min(selector: (cell: TCell, gridIdx: GridIdx) => number): GridIdx {
      return this.reduceGrid(
         (acc, cell, gridIdx) => {
            const selected = selector(cell, gridIdx)
            if (selected >= acc[0]) {
               return acc
            }
            return [selected, gridIdx] as const
         },
         [Number.MAX_VALUE, undefined as unknown as GridIdx] as const)[1]
   }

   sum(selector: (cell: TCell, gridIdx: GridIdx) => number) {
      return this.reduceGrid((sum, neighbour, idx) => sum + selector(neighbour, idx), 0)
   }

   reduceGrid<TAcc>(reducer: (acc: TAcc, cell: TCell, gridIdx: GridIdx) => TAcc, initial: TAcc) {
      let acc = initial
      this.iterate((cell, gridIdx) => acc = reducer(acc, cell, gridIdx))
      return acc
   }

   iterate(handleCell: (cell: TCell, gridIdx: GridIdx) => void) {
      for (let y = 0; y < this.height; y++) {
         for (let x = 0; x < this.width; x++) {
            const cellIdx = { x, y }
            const cell = this.cell(cellIdx)
            handleCell(cell, cellIdx)
         }
      }
   }

   sumNeighbours(
      gridIdx: GridIdx,
      selector: (cell: TCell, gridIdx: GridIdx) => number,
      includeCenter?: boolean,
   ) {
      return this.reduceNeighbours(
         gridIdx,
         (sum, neighbour, p) => sum + selector(neighbour, p),
         0,
         includeCenter)
   }

   reduceNeighbours<TAcc>(
      gridIdx: GridIdx,
      reducer: (acc: TAcc, neighbour: TCell, neighbourIdx: GridIdx) => TAcc,
      initial: TAcc,
      includeCenter?: boolean,
   ): TAcc {
      let acc = initial
      this.iterateNeighbours(
         gridIdx,
         (neighbour, gridIdx) => acc = reducer(acc, neighbour, gridIdx),
         includeCenter)
      return acc
   }

   iterateNeighbours(
      gridIdx: GridIdx,
      handleNeighbour: (neighbour: TCell, neighbourIdx: GridIdx) => void,
      includeCenter?: boolean,
   ) {
      for (const [neighbour, p] of
         GridIdx.neighbours(gridIdx, includeCenter)
                .map(gridIdx => [this.cell(gridIdx), gridIdx] as const)
                .filter(([cell, { x, y }]) => !!cell)) {
         handleNeighbour(neighbour, p)
      }
   }

   bfsDist(
      startIdx: GridIdx,
      targetIdx: GridIdx,
      filter: (cell: TCell, idx: GridIdx) => boolean,
   ): number {
      return bfsDist(
         this.width,
         this.height,
         startIdx,
         targetIdx,
         idx => GridIdx.neighbours(idx),
         cellIdx => filter(this.cell(cellIdx), cellIdx))
   }

   bfs(
      startIdx: GridIdx,
      visit: BfsVisitor,
      filter: (cell: TCell, idx: GridIdx) => boolean,
   ): void {
      bfs(
         this.width,
         this.height,
         startIdx,
         visit,
         idx => GridIdx.neighbours(idx),
         cellIdx => filter(this.cell(cellIdx), cellIdx))
   }

   dijkstraDist(
      startIdx: GridIdx,
      targetIdx: GridIdx,
      computeCosts: (fromIdx: GridIdx, toIdx: GridIdx) => number,
      filter: (cell: TCell, idx: GridIdx) => boolean,
   ): number {
      return dijkstraDist(
         this.width,
         this.height,
         startIdx,
         targetIdx,
         idx => GridIdx.neighbours(idx),
         computeCosts,
         cellIdx => filter(this.cell(cellIdx), cellIdx))
   }

   dijkstra(
      startIdx: GridIdx,
      visit: DijkstraVisitor,
      computeCosts: (fromIdx: GridIdx, toIdx: GridIdx) => number,
      filter: (cell: TCell, idx: GridIdx) => boolean,
   ): void {
      dijkstra(
         this.width,
         this.height,
         startIdx,
         visit,
         idx => GridIdx.neighbours(idx),
         computeCosts,
         cellIdx => filter(this.cell(cellIdx), cellIdx))
   }

   serialize(serializeCell: (cell: TCell) => string): string {
      let serialized = serializeNumber(this.width) + serializeNumber(this.height)
      this.iterate(cell => serialized += serializeCell(cell))
      return serialized
   }

   static deserialize<T extends Grid<TC>, TC>(
      s: string,
      pos: [number],
      init: (width: number, height: number) => T,
      deserializeCell: (s: string, pos: [number]) => TC,
   ): T {
      
      const width = deserializeNumber(s, pos)
      const height = deserializeNumber(s, pos)

      const grid = init(width, height)

      grid.iterate((_, cellIdx) => {
         const cell = deserializeCell(s, pos)
         grid.setCell(cellIdx, cell)
      })
      
      return grid
   }
}

export interface GridIdx {
   x: number;
   y: number;
}

export module GridIdx {

   export function create(x: number, y: number): GridIdx {
      return { x, y }
   }

   export function equals(idx0: GridIdx, idx1: GridIdx): boolean {
      return idx0.x === idx1.x && idx0.y === idx1.y
   }

   export function neighbours({ x, y }: GridIdx, includeCenter?: boolean): GridIdx[] {
      return includeCenter
             ? [{ x, y }, { x: x + 1, y }, { x: x - 1, y }, { x, y: y + 1 }, { x, y: y - 1 }]
             : [{ x: x + 1, y }, { x: x - 1, y }, { x, y: y + 1 }, { x, y: y - 1 }]
   }

   export function isNeighbour({ x: x0, y: y0 }: GridIdx, { x: x1, y: y1 }: GridIdx, includeCenter?: boolean): boolean {
      if (x0 === x1) {
         return y0 === y1 - 1 || y0 === y1 + 1 || (includeCenter && y0 === y1)
      } else if (y0 === y1) {
         return x0 === x1 - 1 || x0 === x1 + 1
      } else {
         return false
      }
   }

   export function distance(idx0: GridIdx, idx1: GridIdx): number {
      return Math.abs(idx0.x - idx1.x) + Math.abs(idx0.y - idx1.y)
   }

   export function toString(idx: GridIdx): string {
      return `<${idx.x},${idx.y}>`
   }
}
