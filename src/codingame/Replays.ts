import { toStringDeep } from "../Tools"
import { createApi } from "./Api"
import * as fs from "fs"

const MY_USER = "Gamli"
const MY_CHALLENGE_PUBLIC_ID = "fall-challenge-2022"
const MY_REMEMBER_ME_COOKIE = "26624600395033d77acdc2bf337a6be2f60d009"

async function main() {

   const api = createApi(MY_REMEMBER_ME_COOKIE)

   const myLeaderBoard = await api.leaderboard.challenge(MY_CHALLENGE_PUBLIC_ID, "country")

   const myUser = myLeaderBoard.users.find(({ pseudo }) => pseudo?.toLowerCase().includes(MY_USER.toLowerCase()))

   const myAgentId = myUser.agentId

   const myLastBattles = (await api.gamesPlayersRankingRemoteService.findLastBattlesByAgentId(myAgentId))

   const myLastBattleResults =
      await Promise.all(myLastBattles.map(({ gameId }) => api.gameResultRemoteService.byGameId(gameId)))

   fs.writeFileSync(
      "test/LastBattleResults.json",
      JSON.stringify(myLastBattleResults, null, "   "),
      { flag: "w" })
}

// noinspection JSIgnoredPromiseFromCall
main()

