import { Board, Cell, EPlayer, Turn } from "./Game"

export function readTurn(width: number, height: number): Turn {

   const inputs = readline().split(" ")

   const board = readBoard(width, height)

   return {
      player: {
         Me: {
            matter: parseInt(inputs[0]),
            recyclers: board.sum(cell => cell.owner === EPlayer.Me && cell.recycler ? 1 : 0),
            bots: board.sum(cell => cell.owner === EPlayer.Me ? cell.units : 0),
         },
         Opp: {
            matter: parseInt(inputs[1]),
            recyclers: board.sum(cell => cell.owner === EPlayer.Opp && cell.recycler ? 1 : 0),
            bots: board.sum(cell => cell.owner === EPlayer.Opp ? cell.units : 0),
         },
      },
      board,
   }
}

function readBoard(width: number, height: number): Board {

   const board = new Board(width, height, null)

   for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
         board.setCell({ x, y }, readCell())
      }
   }

   return board
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