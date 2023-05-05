import { Action, ActionPanel, Grid, useNavigation } from "@raycast/api"
import { useState, useEffect } from "react"
import { CoinData } from "../models/CoinSchema"
import fs from "fs-extra";
import fetch from "node-fetch"
import path from "path"
import CoinCommand from "./currency"

export default function Command() {
  const [page, setPage] = useState(0);
  const [isPaginationLoading, setIsPaginationLoading] = useState(false);
  const [data, setData] = useState<CoinData>({ data: [], metadata: { page: 0, total: 0, size: 15 } });
  const [dataCoinGecko, setDataCoinGecko] = useState<{ id: string, symbol: string, name: string }[] | []>([]);

  // pagesize to be 15, but until api to search all tokens not present, we have
  // to load all of it at once
  const pageSize = 41;

  const loadMoreTokens = async () => {
    setIsPaginationLoading(true);
    if (data.metadata.total !== 0 && (data.metadata.page * data.metadata.size >= data.metadata.total)) {
      setIsPaginationLoading(false);
      return;
    }

    const fetchedData = await fetch(`https://develop-api.mochi.pod.town/api/v1/defi/tokens?page=${page}&size=${pageSize}`)

    if (fetchedData.status !== 200) {
      setIsPaginationLoading(false);
      return false;
    }
    const dataPack: CoinData = (await fetchedData.json() as { data: CoinData }).data as CoinData

    console.log(dataPack.metadata)
    setData(prevData => ({
      data: [...prevData.data, ...dataPack.data],
      metadata: dataPack.metadata,
    }));

    setPage(page + 1);
    setIsPaginationLoading(false);
    return true;
  }

  const loadTokensCoinGecko = async () => {
    setIsPaginationLoading(true)
    if (data.metadata.total !== 0 && (data.metadata.page * data.metadata.size >= data.metadata.total)) {
      setIsPaginationLoading(false);
      return;
    }

    const fetchedData = await fetch(`https://api.coingecko.com/api/v3/coins/list?per_page=${pageSize}&page=${page}`)
    if (fetchedData.status !== 200) {
      return;
    }
    const res = await fetchedData.json() as { id: string, symbol: string, name: string }[]
    setDataCoinGecko(res)
    setIsPaginationLoading(false)
  }

  const [mapState, setMapState] = useState<Map<number, boolean>>(new Map());

  const handleSelectionChange = async (id: string | null) => {
    if (isPaginationLoading) {
      return;
    }
    if (id !== null) {
      const num = +id;
      const rowNum = Math.floor(num / 5);
      if (!mapState.get(rowNum)) {
        if (pageSize - (num % pageSize) <= 5) {
          const res = await loadMoreTokens()
          if (res) {
            setMapState(map => new Map(map.set(rowNum, true)));
          }
        }
      }
    }
  }

  function fileExists(f: string) {
    const exists = fs.pathExistsSync(`${path.dirname(__filename)}/assets/icons/svg/color/${f.toLowerCase()}.svg`)
    if (exists) {
      return `icons/svg/color/${f.toLowerCase()}.svg`
    } else {
      return `icons/svg/color/generic.svg`
    }
  }

  useEffect(() => {
    loadMoreTokens();
  }, []);

  useEffect(() => {
    if (data.metadata.total !== 0 && (data.metadata.page * data.metadata.size >= data.metadata.total)) {
      loadTokensCoinGecko();
    }
  }, [data.metadata.page, data.metadata.size, data.metadata.total]);

  const { push } = useNavigation()
  return (
    <Grid columns={5} inset={Grid.Inset.Medium} isLoading={isPaginationLoading} onSelectionChange={handleSelectionChange}>
      <Grid.Section title="Mochi Bot Supported Tokens">
        {data.data.map((data, index) => {
          const content = fileExists(data.symbol)
          if (data.discord_bot_supported) {
            return (
              <Grid.Item actions={
                <ActionPanel>
                  <Action title="Dive In" onAction={() => {
                    console.log(data.symbol)
                    push(<CoinCommand query={data.symbol} />);
                  }} />
                </ActionPanel>
              } id={`${index}`} title={data.name} content={`${content}`} />
            )
          }
        })}
      </Grid.Section>
      {/* {(data.metadata.page * data.metadata.size >= data.metadata.total) && */}
      {/*   <Grid.Section title="All tokens"> */}
      {/*     {dataCoinGecko.map((data) => { */}
      {/*       const content = fileExists(data.symbol) */}
      {/*       return ( */}
      {/*         <Grid.Item id={`${data.id}`} title={data.name} content={`${content}`} /> */}
      {/*       ) */}
      {/*     })} */}
      {/*   </Grid.Section> */}
      {/* } */}
    </Grid>
  )
}
