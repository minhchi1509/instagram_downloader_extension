import { chromeUtils } from "src/utils/chrome.util";

export const delay = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export const downloadByBatch = async (
  data: any[],
  downloadFunction: any,
  batchSize: number = 1
) => {
  for (let i = 0; i < data.length; i += batchSize) {
    const from = i;
    const to = Math.min(i + batchSize, data.length);
    const sliceData = data.slice(from, to);
    await Promise.all(
      sliceData.map((item: any, index: number) =>
        downloadFunction(item, from + index + 1)
      )
    );
  }
};

export const createCsvContentFromData = <T extends object>(data: T[]) => {
  const csvRows = [];
  const headers = Object.keys(data[0]);
  csvRows.push(headers.join(","));

  for (const row of data) {
    const values = headers.map(
      (header) => `"${row[header as keyof typeof row]}"`
    );
    csvRows.push(values.join(","));
  }
  const csvContent = csvRows.join("\n");
  return csvContent;
};

export const downloadStatisticCsvFile = async <T extends object>(
  data: T[],
  filename: string
) => {
  const csvContent = createCsvContentFromData(data);
  const blob = new Blob([csvContent], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  await chromeUtils.downloadFile({ url, filename });
  URL.revokeObjectURL(url);
};
