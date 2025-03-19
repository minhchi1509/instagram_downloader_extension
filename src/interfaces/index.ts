import { EBackgroundMessage } from "src/constants/enum";

export interface ICurrentUser {
  username: string;
  avatarUrl: string;
  csrfToken: string;
  cookies: string;
}

export interface IProfile {
  id: string;
  username: string;
  full_name: string;
  avatar_url: string;
  follower: number;
  following: number;
  is_private_account: boolean;
  total_posts: number;
}

export interface IMedia {
  id: string;
  downloadUrl: string;
}

export interface IPost {
  id: string;
  code: string;
  title?: string;
  takenAt: string;
  totalMedia: number;
  videoCount: number;
  imageCount: number;
  likeCount: number | null;
  commentCount: number;
  videos: IMedia[];
  images: IMedia[];
}

export interface IReel {
  id: number;
  code: string;
  title?: string;
  takenAt: string;
  likeCount: number | null;
  commentCount: number;
  downloadUrl: string;
}

export interface IStory {
  id: string;
  downloadUrl: string;
  isVideo: boolean;
  takenAt: number;
}

export interface IHighlightStory {
  id: string;
  title: string;
  totalStories: number;
  imageStoryCount: number;
  videoStoryCount: number;
  stories: IStory[];
}

export type TDownloadingType = "POST" | "REEL" | "HIGHLIGHT";

export interface IRemoteMessage<T> {
  type: EBackgroundMessage;
  payload: T;
}

export type TProcessStatus = "RUNNING" | "COMPLETED" | "FAILED";

export interface IDownloadProcess {
  id: string;
  username: string;
  downloadType: TDownloadingType;
  totalDownloadedItems: number;
  status: TProcessStatus;
}

export interface IDownloadAllOptions {
  waitUntilCompleted: boolean;
  delayTimeInSecond?: number;
}
