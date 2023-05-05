import QuickChart from 'quickchart-js';
import fetch from 'node-fetch';
import { NextRequest, NextResponse } from 'next/server';
import { getGradientColor } from '../utils/color';

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
      borderColor: "#DC1FFF",
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
      fontColor: "#DC1FFF",
      color: "#DC1FFF",
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

const API_BASE_URL = "https://api.mochi.pod.town/api/v1"

async function compareToken(
  baseQ: string,
  targetQ: string,
  days: number
) {
  const res = await fetch(`${API_BASE_URL}/defi/coins/compare?base=${baseQ}&target=${targetQ}&interval=${days}`)

  const data = await res.json();

  return data.data
}

export async function renderCompareTokenChart({
  times,
  ratios,
  chartLabel,
}: {
  times: string[]
  ratios: number[]
  chartLabel: string
}) {
  if (!times || !times.length) return null
  const chart = await renderChartImage({
    chartLabel,
    labels: times,
    data: ratios,
  })

  return chart;
}

export async function composeTokenComparisonEmbed(
  baseQ: string,
  targetQ: string
) {
  const data = await compareToken(baseQ, targetQ, 30)

  const { times, ratios, from, to } = data

  const chart = await renderCompareTokenChart({
    times,
    ratios,
    chartLabel: `Price ratio | ${from} - ${to}`,
  })

  return chart;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const base = searchParams.get("base")
  const target = searchParams.get("target")

  const mychart = new QuickChart();
  const config = await composeTokenComparisonEmbed(base, target);

  mychart.setConfig(config)
  mychart.setBackgroundColor("#212327")
  const dataurl = mychart.getUrl()
  console.log(dataurl)
  return NextResponse.json({ imageURL: dataurl })
}
