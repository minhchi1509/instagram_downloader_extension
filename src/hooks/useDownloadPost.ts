import dayjs from "dayjs";
import axiosInstance from "src/configs/axios.config";
import { IDownloadAllOptions, IMedia, IPost } from "src/interfaces";
import useDownloadProcess from "src/store/download-process";
import { chromeUtils } from "src/utils/chrome.util";
import {
  delay,
  downloadByBatch,
  downloadStatisticCsvFile,
} from "src/utils/common.util";
import { showErrorToast } from "src/utils/toast.util";

const useDownloadPost = () => {
  const { updateProcess } = useDownloadProcess();

  const downloadCsvFile = async (posts: IPost[], username: string) => {
    const csvPostsData = posts.map((post, index) => ({
      ordinal_number: index + 1,
      post_url: `https://instagram.com/p/${post.code}`,
      taken_at: post.takenAt,
      total_media: post.totalMedia,
      video_count: post.videoCount,
      image_count: post.imageCount,
      like_count: post.likeCount,
      comment_count: post.commentCount,
    }));
    const filename = `instagram_downloader/${username}/posts/posts_statistic.csv`;
    await downloadStatisticCsvFile(csvPostsData, filename);
  };

  const getPostDataByCode = async (postCode: string): Promise<IPost> => {
    const regex =
      /"xdt_api__v1__media__shortcode__web_info":\{"items":\[(.*?)\]\}\},"extensions":/;
    const { data: responseData } = await axiosInstance.get(
      `https://www.instagram.com/p/${postCode}`,
      {
        headers: {
          Accept:
            "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
        },
      }
    );

    const match = responseData.match(regex);
    if (!match) {
      throw new Error(`Không thể lấy dữ liệu của bài viết`);
    }

    const originalPostData = JSON.parse(match[1]);

    const originalMediaList: any[] = Array.from(
      originalPostData.carousel_media || [originalPostData]
    );
    const videos: IMedia[] = originalMediaList
      .filter((media) => media.media_type === 2)
      .map((media) => ({
        downloadUrl: media.video_versions[0].url,
        id: media.id,
      }));

    const images: IMedia[] = originalMediaList
      .filter((media) => media.media_type === 1)
      .map((media) => ({
        downloadUrl: media.image_versions2.candidates[0].url,
        id: media.id,
      }));

    return {
      id: originalPostData.id,
      code: originalPostData.code,
      title: originalPostData.caption?.text,
      takenAt: dayjs
        .unix(originalPostData.taken_at)
        .format("DD/MM/YYYY HH:mm:ss"),
      totalMedia: originalMediaList.length,
      videoCount: videos.length,
      imageCount: images.length,
      likeCount: originalPostData.like_and_view_counts_disabled
        ? null
        : originalPostData.like_count,
      commentCount: originalPostData.comment_count,
      videos,
      images,
    };
  };

  const startDownloadAllPosts = async (
    username: string,
    processId: string,
    { waitUntilCompleted, delayTimeInSecond }: IDownloadAllOptions
  ) => {
    try {
      let hasMore = true;
      let endCursor = "";
      const allPosts: IPost[] = [];
      const baseQuery = {
        data: { count: 12 },
        username,
        __relay_internal__pv__PolarisIsLoggedInrelayprovider: true,
        __relay_internal__pv__PolarisFeedShareMenurelayprovider: true,
      };

      do {
        const downloadProcess = useDownloadProcess.getState().downloadProcess;
        const isProcessExist = downloadProcess.some(
          (process) => process.id === processId
        );
        if (!isProcessExist) {
          return;
        }
        const { data } = await axiosInstance.get("/", {
          params: {
            doc_id: "8656566431124939",
            variables: JSON.stringify({
              ...baseQuery,
              after: endCursor,
            }),
          },
        });

        const posts: any[] =
          data?.data?.["xdt_api__v1__feed__user_timeline_graphql_connection"]
            ?.edges;
        const pageInfor =
          data?.data?.["xdt_api__v1__feed__user_timeline_graphql_connection"]
            ?.page_info;

        if (!posts || !pageInfor) {
          console.log("😐 There are some errors. Start retrying...");
          continue;
        }

        const formattedPosts: IPost[] = posts.map((post) => {
          const postData = post.node;
          const originalMediaList: any[] = Array.from(
            postData.carousel_media || [postData]
          );
          const videos: IMedia[] = originalMediaList
            .filter((media) => media.media_type === 2)
            .map((media) => ({
              downloadUrl: media.video_versions[0].url,
              id: media.id,
            }));

          const images: IMedia[] = originalMediaList
            .filter((media) => media.media_type === 1)
            .map((media) => ({
              downloadUrl: media.image_versions2.candidates[0].url,
              id: media.id,
            }));

          return {
            id: postData.id,
            code: postData.code,
            title: postData.caption?.text,
            takenAt: dayjs
              .unix(postData.taken_at)
              .format("DD/MM/YYYY HH:mm:ss"),
            totalMedia: originalMediaList.length,
            videoCount: videos.length,
            imageCount: images.length,
            likeCount: postData.like_and_view_counts_disabled
              ? null
              : postData.like_count,
            commentCount: postData.comment_count,
            videos,
            images,
          };
        });

        await downloadByBatch(
          formattedPosts,
          async (post: IPost, postIndex: number) => {
            const downloadProcess =
              useDownloadProcess.getState().downloadProcess;
            const isProcessExist = downloadProcess.some(
              (process) => process.id === processId
            );
            if (!isProcessExist) {
              return;
            }
            const mediaList = [...post.videos, ...post.images];
            await Promise.all(
              mediaList.map(async (media) => {
                await chromeUtils.downloadFile(
                  {
                    url: media.downloadUrl,
                    filename: `instagram_downloader/${username}/posts/post_${
                      allPosts.length + postIndex
                    }/${media.id}.${media.downloadUrl.split(".").pop()}`,
                  },
                  waitUntilCompleted
                );
              })
            );
            updateProcess(processId, {
              totalDownloadedItems: allPosts.length + postIndex,
            });
          }
        );
        allPosts.push(...formattedPosts);
        hasMore = pageInfor.has_next_page;
        endCursor = pageInfor.end_cursor;
        if (!waitUntilCompleted) {
          await delay((delayTimeInSecond || 0) * 1000);
        }
      } while (hasMore);
      if (allPosts.length) {
        await downloadCsvFile(allPosts, username);
      }
      updateProcess(processId, { status: "COMPLETED" });
    } catch (error) {
      showErrorToast((error as Error).message);
      updateProcess(processId, { status: "FAILED" });
    }
  };

  const downloadPostMediaByCode = async (postCode: string) => {
    const postData = await getPostDataByCode(postCode);
    const mediaList = [...postData.videos, ...postData.images];
    await Promise.all(
      mediaList.map(async (media) => {
        await chromeUtils.downloadFile(
          {
            url: media.downloadUrl,
            filename: `post_${postCode}/${media.id}.${media.downloadUrl
              .split(".")
              .pop()}`,
          },
          false
        );
      })
    );
  };

  return { startDownloadAllPosts, downloadPostMediaByCode };
};

export default useDownloadPost;
