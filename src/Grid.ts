import { bfs } from "./Bfs"
import { dijkstra } from "./Dijkstra"

export class Grid<TCell> {

   private readonly _data: TCell[][]
   private readonly _dataFilter: boolean[][]

   constructor(
      public readonly width: number,
      public readonly height: number,
      defaultCell: TCell | ((idx: GridIdx) => TCell),
      private readonly _filter?: (cell: TCell, cellIdx: GridIdx) => boolean,
   ) {

      const createDefaultCell = typeof defaultCell === "function" ? defaultCell : () => defaultCell

      this._data = []
      this._dataFilter = this._filter ? [] : undefined
      for (let y = 0; y < height; y++) {
         const row = []
         const filterRow: boolean[] = this._filter ? [] : undefined
         for (let x = 0; x < width; x++) {
            let cellIdx = { x, y }
            let cell = (createDefaultCell as ((idx: GridIdx) => TCell))(cellIdx)
            row.push(cell)
            if (this._filter) {
               filterRow.push(_filter ? _filter(cell, cellIdx) : true)
            }
         }
         this._data.push(row)
         if (this._filter) {
            this._dataFilter.push(filterRow)
         }
      }
   }

   cell({ x, y }: GridIdx) {
      return this._data[y]?.[x]
   }

   setCell(idx: GridIdx, value: TCell) {
      this._data[idx.y][idx.x] = value
      if (this._filter) {
         this._dataFilter[idx.y][idx.x] = this._filter(value, idx)
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

   filter(f: (cell: TCell, cellIdx: GridIdx) => boolean): Grid<TCell> {
      return new Grid(
         this.width,
         this.height,
         idx => this.cell(idx),
         (cell, cellIdx) => (!this._dataFilter || this._dataFilter[cellIdx.y][cellIdx.x]) && f(cell, cellIdx))
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
            if (!this._dataFilter || this._dataFilter[y][x]) {
               handleCell(cell, cellIdx)
            }
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
                .filter(([cell, { x, y }]) => !!cell && (!this._dataFilter || this._dataFilter[y][x]))) {
         handleNeighbour(neighbour, p)
      }
   }

   bfs(startIdx: GridIdx, visit: (fromIdx: GridIdx, toIdx: GridIdx, depth: number) => boolean): void {
      bfs(
         this.width,
         this.height,
         startIdx,
         visit,
         idx => GridIdx.neighbours(idx))
   }

   dijkstra(
      startIdx: GridIdx,
      visit: (fromIdx: GridIdx, toIdx: GridIdx, depth: number, costs: number) => boolean,
      computeCosts: (fromIdx: GridIdx, toIdx: GridIdx) => number,
   ): void {
      dijkstra(
         this.width,
         this.height,
         startIdx,
         visit,
         idx => GridIdx.neighbours(idx),
         computeCosts)
   }
}

export interface GridIdx {
   x: number;
   y: number;
}

export module GridIdx {

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
}
