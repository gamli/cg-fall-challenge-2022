import { Grid } from "./Grid"

export enum EPlayer {
   Me = "Me",
   Opp = "Opp",
}

export module EPlayer {
   export function opponent(player: EPlayer) {
      return player === EPlayer.Me ? EPlayer.Opp : EPlayer.Me
   }
}

export interface Turn {
   player: {
      [EPlayer.Me]: PlayerState
      [EPlayer.Opp]: PlayerState
   }
   board: Board
}

// export module Turn {
//   
//    export function setMatter(player: EPlayer)
// }

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

}

export interface Cell {
   scrap: number
   owner: EPlayer | null
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