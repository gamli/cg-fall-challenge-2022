import { PredecessorGrid } from "./GraphSearch"
import { Grid, GridIdx } from "./Grid"
import { PriorityQueue } from "./PriorityQueue"
import { memoize } from "./Tools"

export function dijkstraDist(
   gridWidth: number,
   gridHeight: number,
   startIdx: GridIdx,
   targetIdx: GridIdx,
   neighbours: (idx: GridIdx, depth: number) => GridIdx[],
   computeCosts: (fromIdx: GridIdx, toIdx: GridIdx) => number,
   filter: (idx: GridIdx) => boolean,
): number {

   let dist = Number.POSITIVE_INFINITY

   dijkstra(
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
      computeCosts,
      filter)

   return dist
}

export function dijkstra(
   gridWidth: number,
   gridHeight: number,
   startIdx: GridIdx,
   visit: DijkstraVisitor,
   neighbours: (idx: GridIdx, depth: number, costs: number) => GridIdx[],
   computeCosts: (fromIdx: GridIdx, toIdx: GridIdx) => number,
   filter?: (idx: GridIdx) => boolean,
): void {

   const predecessors = createPredecessorGrid(gridWidth, gridHeight)
   const priorityQueue = createPriorityQueue()
   priorityQueue.push({ cellIdx: startIdx, depth: 0, costs: 0, predecessorIdx: startIdx }, 0)
   while (!priorityQueue.isEmpty()) {
      const { cellIdx, depth, costs, predecessorIdx } = priorityQueue.pop()
      if (predecessors.predecessor(cellIdx)) {
         continue
      }
      if (filter && !filter(cellIdx)) {
         continue
      }
      predecessors.predecessor(cellIdx, predecessorIdx)
      if (visit(predecessorIdx, cellIdx, depth, costs, predecessors)) {
         for (const neighbourIdx of neighbours(cellIdx, depth, costs)) {
            if (neighbourIdx.x >= 0
                && neighbourIdx.x < gridWidth
                && neighbourIdx.y >= 0
                && neighbourIdx.y < gridHeight
                && !predecessors.predecessor(neighbourIdx)) {
               const neighbourCosts = costs + computeCosts(cellIdx, neighbourIdx)
               priorityQueue.push({
                  cellIdx: neighbourIdx,
                  depth: depth + 1,
                  costs: neighbourCosts,
                  predecessorIdx: cellIdx,
               }, Math.max(0, neighbourCosts))
            }
         }
      }
   }
}

export type DijkstraVisitor =
   (fromIdx: GridIdx, toIdx: GridIdx, depth: number, costs: number, predecessors: PredecessorGrid) => boolean

type DijkstraQueueItem = {
   cellIdx: GridIdx,
   depth: number,
   costs: number,
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

const createPriorityQueue =
   (() => {
      const memoized =
         memoize(
            () => new PriorityQueue<DijkstraQueueItem>(),
            () => "queue")
      return () => {
         const queue = memoized()
         queue.reset()
         return queue
      }
   })()