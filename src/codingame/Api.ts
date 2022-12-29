import * as https from "https"
import {
   Battle, BattleResult, BattleResultInformation,
   Challenge,
   Codingamer,
   Follower,
   Following,
   Leaderboard, LeaderboardGroup, LeaderboardType, Notification,
   PublicCodingamer,
   SearchResult,
} from "./Types"


export const createApi = (rememberMeCookie: string) => {

   const api = {

      codingamer: {

         byHandle: async (): Promise<Codingamer> => {
            const codingamerJson =
               await postJson(
                  "https://www.codingame.com/services/CodinGamer/findCodingamePointsStatsByHandle",
                  [rememberMeCookie])
            return JSON.parse(codingamerJson) as Codingamer
         },

         byId: async (publicCodingamerId: string): Promise<PublicCodingamer> => {
            const publicCodingamerJson =
               await postJson(
                  "https://www.codingame.com/services/CodinGamer/findCodinGamerPublicInformations",
                  [publicCodingamerId])
            return JSON.parse(publicCodingamerJson) as PublicCodingamer
         },

         followers: async (publicCodingamerId: string): Promise<Follower[]> => {
            const followers =
               await postJson(
                  "https://www.codingame.com/services/CodinGamer/findFollowers",
                  [publicCodingamerId, null /*TODO current_id was ist das?*/, null])
            return JSON.parse(followers) as Follower[]
         },

         followerIds: async (publicCodingamerId: string): Promise<string[]> => {
            const followers =
               await postJson(
                  "https://www.codingame.com/services/CodinGamer/findFollowerIds",
                  [publicCodingamerId])
            return JSON.parse(followers) as string[]
         },

         following: async (publicCodingamerId: string): Promise<Following> => {
            const followings =
               await postJson(
                  "https://www.codingame.com/services/CodinGamer/findFollowing",
                  [publicCodingamerId, null /*TODO current_id was ist das?*/, null])
            return JSON.parse(followings) as Following[]
         },

         followingIds: async (publicCodingamerId: string): Promise<string[]> => {
            const followers =
               await postJson(
                  "https://www.codingame.com/services/CodinGamer/findFollowingIds",
                  [publicCodingamerId])
            return JSON.parse(followers) as string[]
         },
      },

      search: async (query: string): Promise<SearchResult> => {
         const searchResult =
            await postJson("https://www.codingame.com/services/Search/search", [query, "en", null])
         return JSON.parse(searchResult) as SearchResult
      },

      programmingLanguages: async (): Promise<string[]> => {
         const searchResult =
            await postJson("https://www.codingame.com/services/ProgrammingLanguage/findAllIds")
         return JSON.parse(searchResult) as string[]
      },

      notification: {

         unread: async (publicCodingamerId: string): Promise<Notification[]> => {
            const notifications =
               await postJson(
                  "https://www.codingame.com/services/Notification/findUnreadNotifications",
                  [publicCodingamerId])
            return JSON.parse(notifications) as Notification[]
         },

         unseen: async (publicCodingamerId: string): Promise<Notification[]> => {
            const notifications =
               await postJson(
                  "https://www.codingame.com/services/Notification/findUnseenNotifications",
                  [publicCodingamerId])
            return JSON.parse(notifications) as Notification[]
         },

         lastRead: async (publicCodingamerId: string): Promise<Notification[]> => {
            const notifications =
               await postJson(
                  "https://www.codingame.com/services/Notification/findLastReadNotifications",
                  [publicCodingamerId, null])
            return JSON.parse(notifications) as Notification[]
         },

         markAsSeen: async (publicCodingamerId: string, notificationIds: string[]): Promise<void> => {
            await postJson(
               "https://www.codingame.com/services/Notification/markAsSeen",
               [publicCodingamerId, notificationIds])
         },

         markAsRead: async (publicCodingamerId: string, notificationIds: string[]): Promise<void> => {
            await postJson(
               "https://www.codingame.com/services/Notification/markAsRead",
               [publicCodingamerId, notificationIds])
         },
      },

      leaderboard: {

         global: async (
            page: number,
            type: LeaderboardType,
            group: LeaderboardGroup,
            filter: Filter = Filter.create(),
         ): Promise<Leaderboard> => {
            const leaderBoardJson =
               await postJson(
                  "https://www.codingame.com/services/Leaderboards/getGlobalLeaderboard",
                  [page, type, filter, rememberMeCookie, true, group])
            return JSON.parse(leaderBoardJson) as Leaderboard
         },

         challenge: async (
            challengeId: string,
            group: LeaderboardGroup,
            filter: Filter = Filter.create(),
         ): Promise<Leaderboard> => {
            const leaderBoardJson =
               await postJson(
                  "https://www.codingame.com/services/Leaderboards/getFilteredChallengeLeaderboard",
                  [challengeId, rememberMeCookie, group, filter])
            return JSON.parse(leaderBoardJson) as Leaderboard
         },

         puzzle: async (
            puzzleId: string,
            group: LeaderboardGroup,
            filter: Filter = Filter.create(),
         ): Promise<Leaderboard> => {
            const leaderBoardJson =
               await postJson(
                  "https://www.codingame.com/services/Leaderboards/getFilteredPuzzleLeaderboard",
                  [puzzleId, rememberMeCookie, group, filter])
            return JSON.parse(leaderBoardJson) as Leaderboard
         },
      },

      PuzzleRemoteService: {

         findAllMinimalProgress: () => [
            "https://www.codingame.com/services/PuzzleRemoteService/findAllMinimalProgress",
            [null] as unknown[],
         ] as const,
         findProgressByIds: (multiIds: string[]) => [
            "https://www.codingame.com/services/PuzzleRemoteService/findProgressByIds",
            [multiIds, null, 1] as unknown[],
         ] as const,
      },

      ChallengeRemoteService: {

         findAllChallenges: async () => {
            const challengesJSON =
               await postJson("https://www.codingame.com/services/ChallengeRemoteService/findAllChallenges", [])
            return JSON.parse(challengesJSON) as Challenge[]
         },
         findChallengesByTitle: async (...contestTitleSubstrings: string[]) => {
            const allChallenges = await api.ChallengeRemoteService.findAllChallenges()
            return allChallenges.filter(c =>
               contestTitleSubstrings.every(s => c.title.toLowerCase().includes(s.toLowerCase()))) as Challenge[]
         },
      },

      gamesPlayersRankingRemoteService: {

         findLastBattlesByAgentId: async (agentId: number) => {
            const lastBattlesJson =
               await postJson(
                  "https://www.codingame.com/services/gamesPlayersRankingRemoteService/findLastBattlesByAgentId",
                  [agentId, 0])
            return JSON.parse(lastBattlesJson) as Battle[]
         },
      },

      gameResultRemoteService: {

         byGameId: async (gameId: number) => {

            const battleResultJson =
               await postJson(
                  "https://www.codingame.com/services/gameResultRemoteService/findByGameId",
                  [gameId, rememberMeCookie.substring(0, 7)])

            const battleResult = JSON.parse(battleResultJson) as BattleResult

            for (const frame of battleResult.frames) {
               const view = (frame.view as unknown as string).split("\n")
               if(view.length === 2) {
                  frame.view = [parseInt(view[0])]
               } else if(view.length === 3) {
                  frame.view = [parseInt(view[0]), JSON.parse(view[1])]
               } else {
                  throw new Error()
               }
            }

            return battleResult
         },

         informationById: async (gameId: number) => {
            const battleResultJson =
               await postJson(
                  "https://www.codingame.com/services/gameResultRemoteService/findInformationById",
                  [gameId, rememberMeCookie.substring(0, 7)])
            return JSON.parse(battleResultJson) as BattleResultInformation
         },
      },

      LeaderboardsRemoteService: {

         getFilteredChallengeLeaderboardById: async (publicId: string): Promise<Leaderboard> =>
            api.LeaderboardsRemoteService.getFilteredChallengeLeaderboard([
               publicId,
               undefined,
               "global",
               { active: false, column: undefined, filter: undefined },
            ]),

         getFilteredChallengeLeaderboard: async (
            args: [
               publicId: string,
               keineAhnung: undefined,
               auchKeineAhnung: "global" | undefined,
               nochWenigerAhnung: { active: boolean, column: string | undefined, filter: string | undefined },
            ],
         ): Promise<Leaderboard> => {
            const leaderboardJson =
               await postJson(
                  "https://www.codingame.com/services/LeaderboardsRemoteService/getFilteredChallengeLeaderboard",
                  args)
            return JSON.parse(leaderboardJson) as Leaderboard
         },

         getFilteredPuzzleLeaderboard: async (
            args: [
               publicId: string,
               keineAhnung: undefined,
               auchKeineAhnung: "global" | undefined,
               nochWenigerAhnung: { active: boolean, column: string | undefined, filter: string | undefined },
            ],
         ): Promise<Leaderboard> => {
            const leaderboardJson =
               await postJson(
                  "https://www.codingame.com/services/LeaderboardsRemoteService/getFilteredPuzzleLeaderboard",
                  args)
            // this are the different arguments used in cg-stats
            //    [game, undefined, undefined, { "active": true, column: "keyword", filter: player }],
            //    [game, , , {"active" : true, "column" : "LANGUAGE", "filter" : rank.programmingLanguage}]
            //    [game, undefined, 'global', { active: false, column: undefined, filter: undefined}]
            return JSON.parse(leaderboardJson) as Leaderboard
         },
      },
   }

   return api

   async function postJson(url: string, data?: any): Promise<string> {

      let responseData = ""

      return new Promise(function (resolve, reject) {
         const request =
            https.request(
               url,
               {
                  method: "POST",
                  headers: {
                     "Content-Type": "application/json",
                     "Cookie": "rememberMe=" + rememberMeCookie,
                  },
               },
               response => {
                  response.on("data", chunk => responseData += chunk)
                  response.on("end", () => resolve(responseData))
               })
         request.on("error", error => reject(error))
         if (arguments.length == 2) {
            request.write(JSON.stringify(data))
         }
         request.end()
      })
   }
}

export type Filter = {
   active: boolean,
   keyword: string,
   column: string,
   filter: string,
}

export module Filter {
   export function create(partialFilter?: Partial<Filter>): Filter {
      return {
         active: partialFilter && "active" in partialFilter ? partialFilter.active : true,
         column: partialFilter && "column" in partialFilter ? partialFilter.column : undefined,
         filter: partialFilter && "filter" in partialFilter ? partialFilter.filter : undefined,
         keyword: partialFilter && "keyword" in partialFilter ? partialFilter.keyword : undefined,
      }
   }
}
