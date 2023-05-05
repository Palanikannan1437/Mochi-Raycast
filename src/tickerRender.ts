import { getGradientColor } from "./color"
import fetch from 'node-fetch';
import { NEXT_PUBLIC_API_URL } from "./utils/constants";

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

export async function getTickerData({ coin_id, days }: { coin_id: string, days: number }): Promise<{ error: string | null, res: string }> {
  const dataProm = await fetch(`${NEXT_PUBLIC_API_URL}/api/market?coin_id=${coin_id}&days=${days}`)
  if (!dataProm.ok) {
    return { error: "Not Available Yet", res: "https://res.cloudinary.com/ddglxo0l3/image/upload/v1682266903/output-onlinegiftools-4_oghdpq.gif" }
  }
  const data = await dataProm.json() as { imageURL: string }

  return { error: null, res: data.imageURL }
}

