import { Action, ActionPanel, List } from "@raycast/api"
import { CoinData } from "../models/CoinSchema"
import fs from "fs-extra";
import fetch from "node-fetch"
import path from "path"
import { useCachedPromise, usePromise } from "@raycast/utils";
import { getTickerData } from "./tickerRender";
import { useMemo, useState } from "react";
import useNavigationMarkdown from "./hooks/useNavigationMarkdown";

function fileExists(f: string) {
  const exists = fs.pathExistsSync(`${path.dirname(__filename)}/assets/icons/svg/color/${f.toLowerCase()}.svg`)
  if (exists) {
    return `icons/svg/color/${f.toLowerCase()}.svg`
  } else {
    return `icons/svg/color/generic.svg`
  }
}

export default function Command({ query }: { query: string }) {
  const [coinId, setCoinId] = useState<string>("")

  const { isLoading, data } = usePromise(
    async () => {
      const fetchedData = await fetch(`https://api.mochi.pod.town/api/v1/defi/coins?query=${query}`)

      if (fetchedData.status !== 200) {
        return false;
      }

      const dataPack: CoinData = (await fetchedData.json() as { data: CoinData }).data as CoinData

      return dataPack;
    },
  );

  const [currentPointer, setCurrentPointer] = useState(0);

  const ptrData: number[] = useMemo(() => [30, 1, 7], [])

  const [horizontalData] = useNavigationMarkdown(["📊Market Cap", "💰 24h", "💰7d"], currentPointer)

  const { isLoading: graphIsLoading, data: graphData } = useCachedPromise(
    async (coinId: string, currentPointer: number) => {
      // For now ptr data for any value just returns fixed value from the API
      const dataurl = await getTickerData({ coin_id: coinId, days: ptrData[currentPointer] })
      if (dataurl.error) {
        return dataurl;
      }
      return dataurl;
    },
    [coinId, currentPointer],
  );

  return (
    <List isShowingDetail isLoading={isLoading && graphIsLoading} onSelectionChange={(id) => {
      setCoinId(id as string)
    }}>
      {data && data.map((coin) => {
        return (
          <List.Item
            title={coin.name}
            icon={fileExists(coin.symbol)}
            id={coin.id}
            key={coin.id}
            detail={
              <List.Item.Detail markdown={`## ${coin.name} \n***\n ${!graphData?.error ? horizontalData : graphData.error}\n![graph](${graphData?.res})`} />
            }
            actions={
              <ActionPanel>
                <Action title={"Scroll Right"} onAction={() => currentPointer < 4 ? setCurrentPointer(currentPointer + 1) : currentPointer} shortcut={{ modifiers: ["cmd"], key: "arrowRight" }} />
                <Action title={"Scroll Left"} onAction={() => currentPointer > 0 ? setCurrentPointer(currentPointer - 1) : currentPointer} shortcut={{ modifiers: ["cmd"], key: "arrowLeft" }} />
              </ActionPanel>
            }
          />
        )
      })}
    </List>
  )
}
