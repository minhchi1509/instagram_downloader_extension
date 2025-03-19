import { DOWNLOAD_STORIES_IN_HIGHLIGHT_BATCH_SIZE } from "src/constants/variables";
import { IDownloadAllOptions, IStory } from "src/interfaces";
import {
  getAllHighlightsIdOfUser,
  getAllStoriesByHighlightId,
} from "src/services";
import useDownloadProcess from "src/store/download-process";
import { chromeUtils } from "src/utils/chrome.util";
import { delay, downloadByBatch } from "src/utils/common.util";
import { showErrorToast } from "src/utils/toast.util";

const useDownloadHighlight = () => {
  const { updateProcess } = useDownloadProcess();

  const startDownloadAllHightlights = async (
    username: string,
    processId: string,
    { waitUntilCompleted, delayTimeInSecond }: IDownloadAllOptions
  ) => {
    try {
      const allHighlightsId = await getAllHighlightsIdOfUser(username);
      for (let i = 0; i < allHighlightsId.length; i++) {
        const downloadProcess = useDownloadProcess.getState().downloadProcess;
        const isProcessExist = downloadProcess.some(
          (process) => process.id === processId
        );
        if (!isProcessExist) {
          break;
        }
        const highlightId = allHighlightsId[i];
        const stories = await getAllStoriesByHighlightId(allHighlightsId[i]);
        await downloadByBatch(
          stories,
          async (story: IStory, storyIndex: number) => {
            const downloadProcess =
              useDownloadProcess.getState().downloadProcess;
            const isProcessExist = downloadProcess.some(
              (process) => process.id === processId
            );
            if (!isProcessExist) {
              return;
            }
            await chromeUtils.downloadFile(
              {
                url: story.downloadUrl,
                filename: `instagram_downloader/${username}/highlights/highlight_${highlightId}/story_${storyIndex}.${
                  story.isVideo ? "mp4" : "jpg"
                }`,
              },
              waitUntilCompleted
            );
          },
          DOWNLOAD_STORIES_IN_HIGHLIGHT_BATCH_SIZE
        );
        updateProcess(processId, {
          totalDownloadedItems: i + 1,
        });
        if (delayTimeInSecond) {
          await delay(delayTimeInSecond * 1000);
        }
      }
      updateProcess(processId, {
        status: "COMPLETED",
      });
    } catch (error) {
      showErrorToast((error as Error).message);
      updateProcess(processId, {
        status: "FAILED",
      });
    }
  };

  const downloadHighlightStoriesByCode = async (highlightCode: string) => {
    const stories = await getAllStoriesByHighlightId(highlightCode);
    await downloadByBatch(
      stories,
      async (story: IStory, storyIndex: number) => {
        await chromeUtils.downloadFile(
          {
            url: story.downloadUrl,
            filename: `highlight_${highlightCode}/story_${storyIndex}.${
              story.isVideo ? "mp4" : "jpg"
            }`,
          },
          false
        );
      },
      DOWNLOAD_STORIES_IN_HIGHLIGHT_BATCH_SIZE
    );
  };
  return { startDownloadAllHightlights, downloadHighlightStoriesByCode };
};

export default useDownloadHighlight;
