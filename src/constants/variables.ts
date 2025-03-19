export const DOWNLOAD_ALL_TYPE = [
  { label: "Ảnh/video trên bài viết", value: "POST" },
  { label: "Reels", value: "REEL" },
  { label: "Story nổi bật", value: "HIGHLIGHT" },
];

export const DOWNLOAD_SEPARATELY_TYPE = [
  { label: "Ảnh/video trên bài viết", value: "POST" },
  { label: "Reels", value: "REEL" },
  { label: "Story nổi bật", value: "HIGHLIGHT" },
  { label: "Story", value: "STORY" },
  { label: "Ảnh đại diện (HD)", value: "AVATAR" },
];

export const DOWNLOAD_TYPE_TAG_COLOR = {
  POST: "blue",
  REEL: "green",
  HIGHLIGHT: "gold",
};

export const PROCESS_STATUS_TAG_COLOR = {
  RUNNING: "blue",
  COMPLETED: "green",
  FAILED: "red",
};

export const PROCESS_TEXT = {
  RUNNING: "Đang tải",
  COMPLETED: "Hoàn thành",
  FAILED: "Thất bại",
};

export const DOWNLOAD_STORIES_IN_HIGHLIGHT_BATCH_SIZE = 15;
