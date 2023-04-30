import { getGradientColor } from "./color"
import dayjs from 'dayjs';
import fetch from 'node-fetch';
import { ResponseIndexerNFTCollectionTickersData } from './NftTickerData';

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
        "rgba(53,83,192,0.9)",
        "rgba(58,69,110,0.5)",
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
      color: colorConfig.borderColor,
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
            font: {
              size: 18,
            },
          },
        },
      },
      ...(lineOnly && {
        scales: {
          x: {
            grid: {
              display: false,
            },
            display: false,
          },
          y: {
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
  const from = dayjs().subtract(6 * 30, "day").unix() * 1000
  const token = ""
  const fromLabel = dayjs(from).format("MMMM DD, YYYY")
  const toLabel = dayjs(to).format("MMMM DD, YYYY")
  const chartData = data.tickers.prices.map(
    (p) => +(p.amount ?? 0) / Math.pow(10, p.token?.decimals ?? 0)
  )
  const chart = await renderChartImage({
    chartLabel: `Sold price (${token}) | ${fromLabel} - ${toLabel}`,
    labels: data.tickers.timestamps.map((times) => `${dayjs(times).format("MM DD, YYYY")}`),
    data: chartData,
  })
  return chart
}

export async function getTickerData(): Promise<string> {
  const dataProm = await fetch("http://localhost:3000/api/ticker?collectionAddress=0x7aCeE5D0acC520faB33b3Ea25D4FEEF1FfebDE73&from=1674933502000&to=1682708784000")
  console.log("gotTickerData")
  const data = await dataProm.json() as { imageURL: string }
  return data.imageURL
}

