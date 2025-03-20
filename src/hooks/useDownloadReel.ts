import dayjs from "dayjs"

import axiosInstance from "src/configs/axios.config"
import { IDownloadAllOptions, IReel } from "src/interfaces"
import { getInstagramIdAndAvatarByUsername } from "src/services"
import useDownloadProcess from "src/store/download-process"
import { chromeUtils } from "src/utils/chrome.util"
import {
  delay,
  downloadByBatch,
  downloadStatisticCsvFile
} from "src/utils/common.util"
import { showErrorToast } from "src/utils/toast.util"

const useDownloadReel = () => {
  const { updateProcess } = useDownloadProcess()

  const getReelDataByCode = async (reelCode: string): Promise<IReel> => {
    const regex =
      /"xdt_api__v1__media__shortcode__web_info":\{"items":\[(.*?)\]\}\},"extensions":/
    const { data: responseData } = await axiosInstance.get(
      `https://www.instagram.com/reel/${reelCode}`,
      {
        headers: {
          Accept:
            "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7"
        }
      }
    )

    const match = responseData.match(regex)
    if (!match) {
      throw new Error("Không thể lấy dữ liệu của reel")
    }

    const originalReelData = JSON.parse(match[1])

    return {
      id: originalReelData.id,
      code: originalReelData.code,
      commentCount: originalReelData.comment_count,
      takenAt: dayjs
        .unix(originalReelData.taken_at)
        .format("DD/MM/YYYY HH:mm:ss"),
      title: originalReelData.caption?.text,
      likeCount: originalReelData.like_and_view_counts_disabled
        ? null
        : originalReelData.like_count,
      downloadUrl: originalReelData.video_versions[0].url
    }
  }

  const downloadCsvFile = async (reels: IReel[], username: string) => {
    const csvReelsData = reels.map((reel, index) => ({
      ordinal_number: index + 1,
      reel_url: `https://instagram.com/reel/${reel.code}`,
      title: reel.title,
      taken_at: reel.takenAt,
      like_count: reel.likeCount,
      comment_count: reel.commentCount
    }))
    const filename = `instagram_downloader/${username}/reels/reels_statistic.csv`
    await downloadStatisticCsvFile(csvReelsData, filename)
  }

  const startDownloadAllReels = async (
    username: string,
    processId: string,
    { waitUntilCompleted, delayTimeInSecond }: IDownloadAllOptions
  ) => {
    try {
      let hasMore = true
      let endCursor = ""
      const allReels: IReel[] = []
      const { id: igUserId } = await getInstagramIdAndAvatarByUsername(username)
      const baseQuery = {
        data: {
          include_feed_video: true,
          page_size: 12,
          target_user_id: igUserId
        }
      }

      do {
        const downloadProcess = useDownloadProcess.getState().downloadProcess
        const isProcessExist = downloadProcess.some(
          (process) => process.id === processId
        )
        if (!isProcessExist) {
          return
        }
        const { data } = await axiosInstance.get("/", {
          params: {
            doc_id: "8526372674115715",
            variables: JSON.stringify({
              ...baseQuery,
              after: endCursor
            })
          }
        })

        const reelsCode: string[] = data?.data?.[
          "xdt_api__v1__clips__user__connection_v2"
        ]?.edges?.map(({ node: reel }: any) => reel.media.code)
        const pageInfor =
          data?.data?.["xdt_api__v1__clips__user__connection_v2"]?.page_info

        if (!reelsCode || !pageInfor) {
          console.log("😐 There are some errors. Start retrying...")
          continue
        }

        const formattedReels: IReel[] = await Promise.all(
          reelsCode.map(getReelDataByCode)
        )

        await downloadByBatch(
          formattedReels,
          async (reel: IReel, reelIndex: number) => {
            const downloadProcess =
              useDownloadProcess.getState().downloadProcess
            const isProcessExist = downloadProcess.some(
              (process) => process.id === processId
            )
            if (!isProcessExist) {
              return
            }
            await chromeUtils.downloadFile(
              {
                url: reel.downloadUrl,
                filename: `instagram_downloader/${username}/reels/reel_${
                  allReels.length + reelIndex
                }.mp4`
              },
              waitUntilCompleted
            )
          },
          12
        )
        allReels.push(...formattedReels)
        updateProcess(processId, {
          totalDownloadedItems: allReels.length
        })
        hasMore = pageInfor.has_next_page
        endCursor = pageInfor.end_cursor
        if (!waitUntilCompleted) {
          await delay((delayTimeInSecond || 0) * 1000)
        }
      } while (hasMore)
      if (allReels.length) {
        await downloadCsvFile(allReels, username)
      }
      updateProcess(processId, { status: "COMPLETED" })
    } catch (error) {
      showErrorToast((error as Error).message)
      updateProcess(processId, { status: "FAILED" })
    }
  }

  const downloadReelMediaByCode = async (reelCode: string) => {
    const reelData = await getReelDataByCode(reelCode)
    await chromeUtils.downloadFile({
      url: reelData.downloadUrl,
      filename: `reel_${reelData.code}.mp4`
    })
  }

  return { startDownloadAllReels, downloadReelMediaByCode }
}

export default useDownloadReel
