import { AxiosInstance } from "axios"
import axiosInstance from "src/configs/axios.config"
import { ICurrentUser, IProfile, IStory } from "src/interfaces"

export const getCurrentUserInfor = async (
  axios: AxiosInstance
): Promise<Omit<ICurrentUser, "cookies">> => {
  const { data } = await axios.get("https://www.instagram.com/")
  const csrfTokenMatch = data.match(/"csrf_token":"(.*?)"/)
  const usernameMath = data.match(/"username":"(.*?)"/)
  if (!csrfTokenMatch || !usernameMath) {
    throw new Error("Can't get CSRF token or username of your account")
  }
  const csrfToken: string = csrfTokenMatch[1]
  const username: string = usernameMath[1]

  const { avatarUrl } = await getInstagramIdAndAvatarByUsername(username)
  return { csrfToken, username, avatarUrl }
}

export const getInstagramIdAndAvatarByUsername = async (username: string) => {
  const { data } = await axiosInstance.get(
    `https://www.instagram.com/web/search/topsearch/?query=${username}`
  )
  const user = data.users.find((user: any) => user.user.username === username)
  if (!user) {
    throw new Error(`Tên người dùng ${username} không tồn tại`)
  }
  return {
    id: user.user.pk as string,
    avatarUrl: user.user.profile_pic_url as string
  }
}

export const getProfileStatistics = async (username: string) => {
  const { id } = await getInstagramIdAndAvatarByUsername(username)
  const { data } = await axiosInstance.get("/", {
    params: {
      doc_id: "8508998995859778",
      variables: JSON.stringify({
        id,
        render_surface: "PROFILE"
      })
    }
  })

  const user = data.data.user
  const profileData: IProfile = {
    id: user.pk || user.pk,
    username: user.username,
    full_name: user.full_name,
    avatar_url: user.hd_profile_pic_url_info.url,
    follower: user.follower_count,
    following: user.following_count,
    is_private_account: user.is_private,
    total_posts: user.media_count
  }
  return profileData
}

export const getAllStoriesByHighlightId = async (highlightId: string) => {
  const { data } = await axiosInstance.get(
    `https://www.instagram.com/graphql/query/?query_hash=45246d3fe16ccc6577e0bd297a5db1ab&variables={"highlight_reel_ids":[${highlightId}],"reel_ids":[],"location_ids":[],"precomposed_overlay":false}`
  )
  const storiesMedia: any[] = data.data?.reels_media?.[0]?.items
  if (!storiesMedia) {
    throw new Error("Không thể lấy story từ highlight")
  }

  const result: IStory[] = storiesMedia.map((story) => ({
    id: story.id,
    isVideo: story.is_video,
    takenAt: story.taken_at_timestamp,
    downloadUrl: story.is_video
      ? story.video_resources[0].src
      : story.display_url
  }))

  return result
}

export const getAllHighlightsIdOfUser = async (username: string) => {
  const { id: userId } = await getInstagramIdAndAvatarByUsername(username)
  const { data } = await axiosInstance.get("/", {
    params: {
      doc_id: "8198469583554901",
      variables: JSON.stringify({
        user_id: userId
      })
    }
  })
  const highlightsData: any[] = data.data.highlights.edges
  const allHighlightsId: string[] = highlightsData.map(
    (highlight) => highlight.node.id.split(":")[1]
  )

  return allHighlightsId
}

export const getActiveStoriesByUsername = async (
  username: string
): Promise<IStory[]> => {
  const { id: userId } = await getInstagramIdAndAvatarByUsername(username)
  const { data: responseData } = await axiosInstance.get("/", {
    params: {
      query_hash: "45246d3fe16ccc6577e0bd297a5db1ab",
      variables: JSON.stringify({
        highlight_reel_ids: [],
        reel_ids: [userId],
        location_ids: [],
        precomposed_overlay: false
      })
    }
  })
  if (!responseData.data?.reels_media?.length) {
    throw new Error(`Không thể lấy story của ${username}`)
  }
  const originalStoriesData = responseData.data.reels_media[0].items
  const result: IStory[] = originalStoriesData.map((story: any) => ({
    id: story.id,
    takenAt: story.taken_at_timestamp,
    isVideo: story.is_video,
    downloadUrl: story.is_video
      ? story.video_resources[0].src
      : story.display_url
  }))
  return result
}
