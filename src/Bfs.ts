import { Grid, GridIdx } from "./Grid"

export function bfsDist(
   gridWidth: number,
   gridHeight: number,
   startIdx: GridIdx,
   targetIdx: GridIdx,
   neighbours: (idx: GridIdx, depth: number) => GridIdx[],
   filter: (idx: GridIdx) => boolean,
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
   visit: (fromIdx: GridIdx, toIdx: GridIdx, depth: number) => boolean,
   neighbours: (idx: GridIdx, depth: number) => GridIdx[],
   filter: (idx: GridIdx) => boolean,
): void {

   const visited = new Grid<boolean>(gridWidth, gridHeight, false)
   const queue: BfsQueueItem[] = [{ cellIdx: startIdx, depth: 0, predecessorIdx: startIdx }]
   visited.setCell(startIdx, true)
   while (queue.length !== 0) {
      const { cellIdx, depth, predecessorIdx } = queue.shift() as BfsQueueItem
      if (!filter(cellIdx)) {
         continue
      }
      if (visit(predecessorIdx, cellIdx, depth)) {
         for (const neighbourIdx of neighbours(cellIdx, depth)) {
            if ((neighbourIdx.x >=
                0 &&
                neighbourIdx.x <
                gridWidth &&
                neighbourIdx.y >=
                0 &&
                neighbourIdx.y <
                gridHeight)
                && !visited.cell(neighbourIdx)) {
               visited.setCell(neighbourIdx, true)
               queue.push({
                  cellIdx: neighbourIdx,
                  depth: depth + 1,
                  predecessorIdx: cellIdx,
               })
            }
         }
      }
   }
}

type BfsQueueItem = {
   cellIdx: GridIdx,
   depth: number,
   predecessorIdx: GridIdx,
}