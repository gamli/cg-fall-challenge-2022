import { toStringDeep } from "../Tools"
import { createApi } from "./Api"
import * as fs from "fs"

const MY_USER = "Gamli"
const MY_CHALLENGE_PUBLIC_ID = "fall-challenge-2022"
const MY_REMEMBER_ME_COOKIE = "26624600395033d77acdc2bf337a6be2f60d009"

async function main() {

   const api = createApi(MY_REMEMBER_ME_COOKIE)

   // console.log(await findChallengesByTitle("fall", "2022"))

   const myLeaderBoard = await api.leaderboard.challenge(MY_CHALLENGE_PUBLIC_ID, "country")

   const myUser = myLeaderBoard.users.find(({ pseudo }) => pseudo?.toLowerCase().includes(MY_USER.toLowerCase()))

   const myAgentId = myUser.agentId

   const myLastBattles = (await api.gamesPlayersRankingRemoteService.findLastBattlesByAgentId(myAgentId))

   const myLastBattleResults =
      await Promise.all(myLastBattles.map(({ gameId }) => api.gameResultRemoteService.byGameId(gameId)))

   fs.writeFileSync(
      "test/LastBattleResults.json",
      JSON.stringify(myLastBattleResults, null, "   "),
      //toStringDeep(myLastBattleResults, { colors: false }),
      { flag: "w" })

   // console.log(toStringDeep(myLastBattleResults))

   // console.log(myLeaderBoard.users.map(({ pseudo }) => pseudo).find(x => x.startsWith("Ga")))

   //const myLeaderBoard = await api.LeaderboardsRemoteService.getFilteredChallengeLeaderboardById(MY_CHALLENGE_PUBLIC_ID)
   // const myLeaderBoard =
   //    await api.leaderboard.challenge(
   //       MY_CHALLENGE_PUBLIC_ID,
   //       "global",
   //       Filter.create({
   //          active: false,
   //          filter: undefined,
   //          keyword: undefined,
   //          column: undefined,
   //       }))

   // let myUser: LeaderboardPlayer
   // let page = 1
   // while (true) {
   //
   //    const myLeaderBoard = await api.leaderboard.global(page, "GENERAL", "global")
   //
   //    for (const user of myLeaderBoard.users.filter(u => !u.pseudo || u.pseudo.startsWith("G"))) {
   //       console.log(user.pseudo || user)
   //    }
   //
   //    const myLeaderBoardUser =
   //       myLeaderBoard.users.find(({ pseudo }) => pseudo?.toLowerCase().includes(MY_USER.toLowerCase()))
   //
   //    if (myLeaderBoardUser) {
   //       myUser = myLeaderBoardUser
   //       break
   //    }
   //
   //    page++
   // }
   //
   // const myAgentId = myUser.agentId
   //
   // const myLastBattles = await api.gamesPlayersRankingRemoteService.findLastBattlesByAgentId(myAgentId)
   //
   // console.log(toStringDeep(myLastBattles))
}


// noinspection JSIgnoredPromiseFromCall
main()

