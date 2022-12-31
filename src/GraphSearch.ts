import { Grid, GridIdx } from "./Grid"


export class PredecessorGrid {

   private readonly _grid: Grid<GridIdx>

   constructor(width: number, height: number) {
      this._grid = new Grid<GridIdx>(width, height, null)
   }

   predecessor<TArgs extends [GridIdx] | [GridIdx, GridIdx]>(...args: TArgs)
      : TArgs extends [GridIdx, GridIdx] ? void : GridIdx {

      const [idx, predecessor] = args
      if (predecessor) {
         this._grid.setCell(idx, predecessor)
      } else {
         return this._grid.cell(idx) as TArgs extends [GridIdx, GridIdx] ? void : GridIdx
      }
   }

   createPath(targetIdx: GridIdx): GridIdx[] {
      const path = [] as GridIdx[]
      this.iteratePath(targetIdx, idx => {
         path.push(idx)
      })
      return path
   }

   iteratePath(targetIdx: GridIdx, handleCell: PathCellHandler) {

      if (!this.predecessor(targetIdx)) {
         throw new Error("target has no predecessor")
      }

      if (this.predecessor(targetIdx) === targetIdx) {
         handleCell(targetIdx, EPathCellType.All)
      } else {
         if (this.iteratePathRecursive(this.predecessor(targetIdx), handleCell)) {
            handleCell(targetIdx, EPathCellType.PathCellEnd)
         }
      }
   }

   private iteratePathRecursive(idx: GridIdx, handleCell: PathCellHandler): boolean {

      let predecessorIdx = this.predecessor(idx)

      if (!predecessorIdx) {
         throw new Error("target has no predecessor")
      }

      if (predecessorIdx === idx) {
         return cellHandlerResultToBoolean(handleCell(idx, EPathCellType.PathCellStart))
      } else {
         const recursiveResult = cellHandlerResultToBoolean(this.iteratePathRecursive(predecessorIdx, handleCell))
         if (recursiveResult) {
            return cellHandlerResultToBoolean(handleCell(idx, EPathCellType.PathCellIntermediate))
         }
         return false
      }
   }

   reset() {
      this._grid.setAllCells(null)
   }
}

export type PathCellHandler = (idx: GridIdx, type: EPathCellType) => void | boolean

function cellHandlerResultToBoolean(result: void | boolean): boolean {
   return result === undefined ? true : result as boolean
}

export enum EPathCellType {
   PathCellStart = 0,
   PathCellIntermediate = 1,
   PathCellEnd = 2,
   All = 3,
}

