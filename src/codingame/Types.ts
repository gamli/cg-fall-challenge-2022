import Frame = BattleResult.Frame
import { Action } from "../Action"
import { readGameState } from "../input"
import { PlayerMove } from "../Move"

export type Notification = unknown

export type Follower = unknown
export type Following = unknown
export type SearchResult = unknown

export interface Codingamer extends PublicCodingamer {

}

export interface PublicCodingamer {

}

export interface BattleResult {
   frames: Frame[]
   gameId: number,
   refereeInput: string,
   scores: number[],
   ranks: number[],
   tooltips: string[],
   agents: {
      index: number
      codingamer: {
         userId: number
         pseudo: string
         enable: boolean
         avatar: number
      }
      agentId: number
      score: number
      valid: boolean
   }[],
   metadata: { [key: string]: string }
}

export module BattleResult {

   export interface Frame {
      gameInformation: string
      summary: string
      view:
         [
            number,
            {
               global: { graphics: string }
               frame: {
                  duration: number
                  graphics: string
               }
            },
         ]
         |
         [number]
      keyframe: boolean
      agentId: number
      stdout: string
      stderr: string
   }

   export module Frame {

      export function playerMove(frame: Frame): PlayerMove {
         return frame
         .stdout
         .split(";").map(actionString => Action.parse(actionString.trim()))
      }

      export function extractStateFromFrame(frame: Frame, turnIdx: number, gridWidth: number, gridHeight: number) {

         let lines: string[]

         if (turnIdx === 0) {
            lines = frame.stderr.split("\n")
            const wh = lines[0].split(" ").map(s => parseInt(s))
            gridWidth = wh[0]
            gridHeight = wh[1]
            lines.splice(0, 1)
         } else {
            lines = frame.stderr.split("\n")
         }

         let lineIdx = 0
         const readline = () => {
            if (lineIdx >= lines.length) {
               throw new Error("index out of bounds: " + lineIdx + " vs " + lines.length)
            }
            const line = lines[lineIdx]
            lineIdx++
            return line
         }

         return readGameState(gridWidth, gridHeight, turnIdx + 1, readline)
      }
   }
}

export interface BattleResultInformation {

}

export interface Battle {
   players: BattlePlayer[],
   gameId: number,
   done: boolean,
}

export interface BattlePlayer {
   playerAgentId: number,
   position: number,
   userId: number,
   nickname: string,
   publicHandle: string,
   avatar: number,
   testSessionHandle: string,
}

export type Challenge = {
   challengeId: number,
   title: string,
   date: number,
   utc: number,
   enable: boolean,
   placesOnlineAvailable: number,
   placesOnSiteAvailable: number,
   placesOnlineMax: number,
   placesOnSiteMax: number,
   challengerSubscriptionSeq: number,
   subscriptionOpened: boolean,
   visible: boolean,
   enableSelectCompany: boolean,
   reportEnabled: boolean,
   lateTimeMax: number,
   needLogin: boolean,
   enableScoreGlobal: boolean,
   jobScoreGlobal: boolean,
   mailinglist: boolean,
   publicId: string,
   enableIcal: boolean,
   type: string,
   rankingCompleted: boolean,
   needPreRegistration: boolean,
   shareable: boolean,
   delayRedirectRankingWhenFinished: number,
   applicationEndDate: number,
   applicantContactEndDate: number,
   training: boolean,
   vip: boolean,
   finished: boolean,
   closed: boolean,
   started: boolean,
   privateEvent: boolean,
   defaultAi: boolean,
   registrationEnable: boolean,
   isolated: boolean,
   enableLeaderboard: boolean,
}

export type Leaderboard = {
   users: LeaderboardPlayer[],
   count: number,
   filteredCount: number,
   programmingLanguages: { [lang: string]: number },
   leagues: { [league: string]: League },
   customFormValueCounters: unknown,
}

export type LeaderboardType =
   "GENERAL" |
   "CONTESTS" |
   "BOT_PROGRAMMING" |
   "OPTIM" |
   "CODEGOLF"

export type LeaderboardGroup =
   "global" |
   "country" |
   "company" |
   "school" |
   "following"

export type LeaderboardPlayer = {
   pseudo: string,
   rank: number,
   localRank: number,
   score: number,
   testSessionHandle: string,
   league: LeaderboardPlayerLeague,
   eligibleForPromotion: boolean,
   programmingLanguage: string,
   updateTime: number,
   creationTime: number,
   percentage: number,
   agentId: number,
   inProgress: boolean,
   codingamer: Condingamer,
}

export type LeaderboardPlayerLeague = {
   divisionIndex: number,
   divisionCount: number,
   divisionAgentsCount: number,
   openingLeaguesCount: number,
   divisionOffset: number,
   openingDate: number,
}

export type Condingamer = {
   userId: number,
   pseudo: string,
   countryId: string,
   publicHandle: string,
   avatar: number,
   level: number,
   category: string,
}

export type League = {
   divisionIndex: number,
   divisionCount: number,
   divisionAgentsCount: number,
   divisionOffset: number,
}

