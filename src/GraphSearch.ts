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

   createPath(targetIdx: GridIdx) {
      const path = [] as GridIdx[]
      this.iteratePath(targetIdx, idx => path.push(idx))
      return path
   }

   iteratePath(targetIdx: GridIdx, handleCell: PathCellHandler) {

      if (!this.predecessor(targetIdx)) {
         throw new Error("target has no predecessor")
      }

      if (this.predecessor(targetIdx) === targetIdx) {
         handleCell(targetIdx, EPathCellType.All)
      } else {
         this.iteratePathRecursive(this.predecessor(targetIdx), handleCell)
         handleCell(targetIdx, EPathCellType.PathCellEnd)
      }
   }

   private iteratePathRecursive(
      idx: GridIdx,
      handleCell: (idx: GridIdx, type: EPathCellType) => void,
   ) {

      if (!this.predecessor(idx)) {
         throw new Error("target has no predecessor")
      }

      if (this.predecessor(idx) === idx) {
         handleCell(idx, EPathCellType.PathCellStart)
      } else {
         this.iteratePathRecursive(this.predecessor(idx), handleCell)
         handleCell(idx, EPathCellType.PathCellIntermediate)
      }
   }

   reset() {
      this._grid.setAllCells(null)
   }
}

export type PathCellHandler = (idx: GridIdx, type: EPathCellType) => void

export enum EPathCellType {
   PathCellStart = 0,
   PathCellIntermediate = 1,
   PathCellEnd = 2,
   All = 3,
}

