import { Grid, GridIdx } from "./Grid";
import { PriorityQueue } from "./PriorityQueue";

export function dijkstra(
    gridWidth: number,
    gridHeight: number,
    startIdx: GridIdx,
    visit: (fromIdx: GridIdx, toIdx: GridIdx, depth: number, costs: number) => boolean,
    neighbours: (idx: GridIdx, depth: number, costs: number) => GridIdx[],
    computeCosts: (fromIdx: GridIdx, toIdx: GridIdx) => number): void {

    const visited = new Grid<boolean>(gridWidth, gridHeight, false);
    const priorityQueue = new PriorityQueue<DijkstraQueueItem>();
    priorityQueue.push({ cellIdx: startIdx, depth: 0, costs: 0, predecessorIdx: startIdx }, 0);
    while (priorityQueue.size !== 0) {
        const { cellIdx, depth, costs, predecessorIdx } = priorityQueue.pop();
        if (visited.cell(cellIdx)) {
            continue;
        }
        visited.setCell(cellIdx, true);
        if (visit(predecessorIdx, cellIdx, depth, costs)) {
            for (const neighbourIdx of neighbours(cellIdx, depth, costs)) {
                if ((neighbourIdx.x >= 0 && neighbourIdx.x < gridWidth && neighbourIdx.y >= 0 && neighbourIdx.y < gridHeight)
                    && !visited.cell(neighbourIdx)) {
                    const neighbourCosts = costs + computeCosts(cellIdx, neighbourIdx);
                    priorityQueue.push({
                        cellIdx: neighbourIdx,
                        depth: depth + 1,
                        costs: neighbourCosts,
                        predecessorIdx: cellIdx
                    }, Math.max(0, neighbourCosts));
                }
            }
        }
    }
}

type DijkstraQueueItem = {
    cellIdx: GridIdx,
    depth: number,
    costs: number,
    predecessorIdx: GridIdx,
};