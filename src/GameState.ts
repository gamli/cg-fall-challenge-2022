import { Grid, GridIdx } from "./Grid"


export interface GameState {
   turn: number
   player: [PlayerState, PlayerState]
   board: Board
}

export module GameState {

   export function clone(state: GameState): GameState {
      return {
         turn: state.turn,
         player: [{ ...state.player[0] }, { ...state.player[1] }],
         board: state.board.clone(),
      }
   }
}

export type Owner = Player | null

export type Player = 0 | 1

export module Player {
   export function opponent(player: Player): Player {
      return player === 0 ? 1 : 0
   }
}

export interface PlayerState {
   matter: number
   recyclers: number
   bots: number
}

// export module PlayerState {
//   
//    export function setMatter(playerState: PlayerState, matter: number) {
//       return {
//          ...playerState,
//          matter,
//       }
//    }
//
//    export function setRecyclers(playerState: PlayerState, matter: number) {
//       return {
//          ...playerState,
//          matter,
//       }
//    }
//
//    export function setMatter(playerState: PlayerState, matter: number) {
//       return {
//          ...playerState,
//          matter,
//       }
//    }
// }

export class Board extends Grid<Cell> {

   clone(): Board {
      return new Board(this.width, this.height, idx => this.cell(idx))
   }

   iterateRecyclers(handleRecycler: (idx: GridIdx) => void) {
      return this.iterate((cell, idx) => {
         if (cell.recycler) {
            handleRecycler(idx)
         }
      })
   }
}

export interface Cell {
   scrap: number
   owner: Owner
   units: number
   recycler: boolean
   inRangeOfRecycler: boolean
   canBuild: boolean
   canSpawn: boolean
}

export module Cell {
   export function isPath(cell: Cell): boolean {
      return !cell.recycler && cell.scrap > 0
   }
}