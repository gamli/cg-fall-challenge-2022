import { PredecessorGrid } from "./GraphSearch"
import { Grid, GridIdx } from "./Grid"
import { Queue } from "./Queue"
import { memoize } from "./Tools"

export function bfsDist(
   gridWidth: number,
   gridHeight: number,
   startIdx: GridIdx,
   targetIdx: GridIdx,
   neighbours: (idx: GridIdx, depth: number) => GridIdx[],
   filter?: (idx: GridIdx) => boolean,
): number {

   let dist = Number.POSITIVE_INFINITY

   bfs(
      gridWidth,
      gridHeight,
      startIdx,
      (_, to, d) => {
         if (to === targetIdx) {
            dist = d
            return false
         }
         return true
      },
      neighbours,
      filter)

   return dist
}

export function bfs(
   gridWidth: number,
   gridHeight: number,
   startIdx: GridIdx,
   visit: BfsVisitor,
   neighbours: (idx: GridIdx, depth: number) => GridIdx[],
   filter?: (idx: GridIdx) => boolean,
): void {

   const predecessors = createPredecessorGrid(gridWidth, gridHeight)
   const queue = createQueue()
   queue.enqueue({ cellIdx: startIdx, depth: 0, predecessorIdx: null })
   while (!queue.isEmpty()) {
      const { cellIdx, depth, predecessorIdx } = queue.dequeue()
      if (predecessors.predecessor(cellIdx)) {
         continue
      }
      if (filter && !filter(cellIdx)) {
         continue
      }
      predecessors.predecessor(cellIdx, predecessorIdx)
      if (visit(predecessorIdx, cellIdx, depth, predecessors)) {
         for (const neighbourIdx of neighbours(cellIdx, depth)) {
            if (neighbourIdx.x >= 0
                && neighbourIdx.x < gridWidth
                && neighbourIdx.y >= 0
                && neighbourIdx.y < gridHeight
                && !predecessors.predecessor(neighbourIdx)) {
               queue.enqueue({
                  cellIdx: neighbourIdx,
                  depth: depth + 1,
                  predecessorIdx: cellIdx,
               })
            }
         }
      }
   }
}

export type BfsVisitor = (fromIdx: GridIdx, toIdx: GridIdx, depth: number, predecessors: PredecessorGrid) => boolean

type BfsQueueItem = {
   cellIdx: GridIdx,
   depth: number,
   predecessorIdx: GridIdx,
}

const createPredecessorGrid =
   (() => {
      const memoized =
         memoize(
            (width: number, height: number) => new PredecessorGrid(width, height),
            (width: number, height: number) => width + ";" + height)
      return (width: number, height: number) => {
         const grid = memoized(width, height)
         grid.reset()
         return grid
      }
   })()

const createQueue =
   (() => {
      const memoized =
         memoize(
            () => new Queue<BfsQueueItem>(),
            () => "queue")
      return () => {
         const queue = memoized()
         queue.reset()
         return queue
      }
   })()