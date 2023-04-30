import QuickChart from 'quickchart-js';
import { getGradientColor } from "./color"
import dayjs from 'dayjs';  
import fetch from 'node-fetch';
import { ResponseIndexerNFTCollectionTickersData } from '../models/NftRenderModels';
import { NextResponse } from 'next/server';

export function formatDigit(str: string, fractionDigits = 6, force = false) {
  const num = Number(str)
  const s = num.toLocaleString(undefined, { maximumFractionDigits: 18 })
  const [left, right = ""] = s.split(".")
  if (Number(right) === 0 || right === "" || left.length >= 4) return left
  const numsArr = right.split("")
  let rightStr = numsArr.shift() as string
  if (!force) {
    while (Number(rightStr) === 0 || rightStr.length < fractionDigits) {
      const nextDigit = numsArr.shift()
      if (nextDigit === undefined) break
      rightStr += nextDigit
    }
  } else {
    rightStr += numsArr.slice(0, fractionDigits - 1)
  }
  while (rightStr.endsWith("0")) {
    rightStr = rightStr.slice(0, rightStr.length - 1)
  }
  return left + "." + rightStr
}

export async function renderChartImage({
  chartLabel,
  labels,
  data = [],
  colorConfig,
  lineOnly,
}: {
    chartLabel?: string
    labels: string[]
    data: number[]
    colorConfig?: {
      borderColor: string
      backgroundColor: string | CanvasGradient
    }
    lineOnly?: boolean
  }) {
  if (!colorConfig) {
    colorConfig = {
      borderColor: "#009cdb",
      backgroundColor: getGradientColor(
        "rgba(0,0,0,0)",
        "rgba(0,0,0,0)",
        5
      ).join(","),
    }
  }
  if (lineOnly) {
    colorConfig.backgroundColor = "rgba(0, 0, 0, 0)"
  }
  const xAxisConfig = {
    ticks: {
      font: {
        size: 16,
      },
      fontColor : "#ffffff",
      color: colorConfig.borderColor,
    },
    grid: {
      borderColor: colorConfig.borderColor,
    },
  }
  const yAxisConfig = {
    ticks: {
      font: {
        size: 16,
      },
      callback: (value: string | number) => {
        const rounded = Number(value).toPrecision(2)
        return rounded.includes("e") && Number(value) < 1
          ? rounded
          : Number(rounded) < 0.01 || Number(rounded) > 1000000
            ? Number(rounded).toExponential()
            : formatDigit(String(value))
      },
    },
    grid: {
      borderColor: colorConfig.borderColor,
    },
  }
  return {
    type: "line",
    data: {
      labels,
      datasets: [
        {
          label: chartLabel,
          data,
          borderWidth: lineOnly ? 10 : 3,
          pointRadius: 0,
          fill: true,
          ...colorConfig,
          tension: 0.2,
        },
      ],
    },
    options: {
      
      scales: {
        y: yAxisConfig,
        x: xAxisConfig,
      },
      plugins: {
        legend: {
          labels: {
            // This more specific font property overrides the global property
            color: "#ffffff",
            font: {
              size: 18,
            },
          },
        },
      },
      ...(lineOnly && {
        scales: {
          x: {
            ticks: {
              fontColor: "#ffffff", // Add this line
            },
            grid: {
              display: false,
            },
            display: false,
          },
          y: {
            ticks: {
              fontColor: "#ffffff"
            },
            grid: {
              display: false,
            },
            display: false,
          },
        },
        plugins: {
          legend: {
            display: false,
          },
        },
      }),
    },
  }
}

async function renderNftTickerChart(
  data: ResponseIndexerNFTCollectionTickersData
) {
  if (!data?.tickers?.prices || !data?.tickers?.timestamps) {
    return null
  }
  const to = dayjs().unix() * 1000
  const from = dayjs().subtract(30, "day").unix() * 1000
  const token = ""
  const fromLabel = dayjs(from).format("MMMM DD, YYYY")
  const toLabel = dayjs(to).format("MMMM DD, YYYY")
  const chartData = data.tickers.prices.map(
    (p) => +(p.amount ?? 0) / Math.pow(10, p.token?.decimals ?? 0)
  )
  const chart = await renderChartImage({
    chartLabel: `Sold price (${token}) | ${fromLabel} - ${toLabel}`,
    labels: data.tickers.timestamps.map((times) => `${dayjs(times).format("MMMM DD")}`),
    data: chartData,
  })
  return chart
}
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const collectionAddress = searchParams.get("collectionAddress")
  const to = searchParams.get("to")
  const from = searchParams.get("from")
  const mychart = new QuickChart();
  const dataProm = await fetch(`https://api.indexer.console.so/api/v1/nft/ticker/${collectionAddress}?from=${from}&to=${to}`)
  if (dataProm.status !== 200 ){
    console.log("Status is not 200 actually\n")
  }
  const datajson = await dataProm.json() as { data : ResponseIndexerNFTCollectionTickersData} 
  const data = datajson.data as ResponseIndexerNFTCollectionTickersData 
  const config = await renderNftTickerChart(data);
  mychart.setConfig(config)
  mychart.setBackgroundColor("transparent")
  const dataurl = mychart.getUrl()
  return NextResponse.json({ imageURL: dataurl })
}

