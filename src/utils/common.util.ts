import { format } from "@fast-csv/format"

import { chromeUtils } from "src/utils/chrome.util"

export const delay = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms))

export const downloadByBatch = async (
  data: any[],
  downloadFunction: any,
  batchSize: number = 1
) => {
  for (let i = 0; i < data.length; i += batchSize) {
    const from = i
    const to = Math.min(i + batchSize, data.length)
    const sliceData = data.slice(from, to)
    await Promise.all(
      sliceData.map((item: any, index: number) =>
        downloadFunction(item, from + index + 1)
      )
    )
  }
}

export const createCsvContentFromData = async <T extends object>(data: T[]) => {
  if (data.length === 0) return ""

  return new Promise<string>((resolve) => {
    const csvStream = format({ headers: true })
    let csvContent = ""

    csvStream
      .on("data", (chunk) => {
        csvContent += chunk.toString()
      })
      .on("end", () => {
        resolve(csvContent)
      })

    data.forEach((row) => csvStream.write(row))
    csvStream.end()
  })
}

export const downloadStatisticCsvFile = async <T extends object>(
  data: T[],
  filename: string
) => {
  const csvContent = await createCsvContentFromData(data)
  const blob = new Blob([csvContent], { type: "text/csv" })
  const url = URL.createObjectURL(blob)
  await chromeUtils.downloadFile({ url, filename })
  URL.revokeObjectURL(url)
}
