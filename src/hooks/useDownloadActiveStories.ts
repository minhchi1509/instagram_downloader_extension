import { DOWNLOAD_STORIES_IN_HIGHLIGHT_BATCH_SIZE } from "src/constants/variables"
import { IStory } from "src/interfaces"
import { getActiveStoriesByUsername } from "src/services"
import { chromeUtils } from "src/utils/chrome.util"
import { downloadByBatch } from "src/utils/common.util"

const useDownloadActiveStories = () => {
  const downloadActiveStories = async (username: string) => {
    const activeStories = await getActiveStoriesByUsername(username)
    await downloadByBatch(
      activeStories,
      async (story: IStory, storyIndex: number) => {
        await chromeUtils.downloadFile(
          {
            url: story.downloadUrl,
            filename: `instagram_downloader/${username}/active_stories/story_${storyIndex}.${
              story.isVideo ? "mp4" : "jpg"
            }`
          },
          false
        )
      },
      DOWNLOAD_STORIES_IN_HIGHLIGHT_BATCH_SIZE
    )
  }
  return { downloadActiveStories }
}

export default useDownloadActiveStories
