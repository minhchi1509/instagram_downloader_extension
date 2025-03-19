import { type TDownloadingType } from "src/interfaces"

export interface IDownloadAllForm {
  username: string
  type: TDownloadingType
  waitUntilCompleted: boolean
  delayTimeInSecond?: number
}

export interface IDownloadSeparatelyForm {
  type: TDownloadingType | "STORY" | "AVATAR"
  id: string
}
