import { useState, useEffect } from "react";

function surroundElement(arr: string[], i: number) {
  let result = ''
  for (let j = 0; j < arr.length; j++) {
    if (j !== i) {
      result += `\`${arr[j]}\`` + '     '
    } else {
      result += arr[j] + '     '
    }
  }
  return result
}

const useNavigationMarkdown = (options: string[], startPointer: number) => {
  const arrowLeft = "&#x2190;"
  const arrowRight = "&#x2192;"
  const [data, setData] = useState<string>(``);

  useEffect(() => {
    if (startPointer >= options.length) {
      startPointer = options.length - 1
    } else if (startPointer < 0) {
      startPointer = 0
    }

    const allData = surroundElement(options, startPointer)

    setData(arrowLeft + "   " + allData + arrowRight + "\n")

  }, [startPointer])

  return [data];
};

export default useNavigationMarkdown;




