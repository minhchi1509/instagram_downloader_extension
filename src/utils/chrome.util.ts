import { EBackgroundMessage } from "src/constants/enum";

const getChromeCookies = async (domain: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    chrome.cookies.getAll({ domain }, function (cookies) {
      if (cookies.length > 0) {
        let cookieList = cookies
          .map((cookie) => `${cookie.name}=${cookie.value}`)
          .join(";");
        resolve(cookieList);
      } else {
        reject("Không tìm thấy cookie");
      }
    });
  });
};

const getStorage = async <T>(key: string): Promise<T> => {
  return new Promise((resolve) => {
    chrome.storage.local.get(key, function (result) {
      resolve(result[key]);
    });
  });
};

const setStorage = async <T>(key: string, value: T): Promise<void> => {
  return new Promise((resolve) => {
    chrome.storage.local.set({ [key]: value }, function () {
      resolve();
    });
  });
};

const removeStorage = async (key: string): Promise<void> => {
  return new Promise((resolve) => {
    chrome.storage.local.remove(key, function () {
      resolve();
    });
  });
};

const sendMessage = async <T>(type: EBackgroundMessage, payload?: T) => {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage({ type, payload }, function () {
      resolve("Message sent");
    });
  });
};

const downloadFile = async (
  options: chrome.downloads.DownloadOptions,
  waitUntilCompleted: boolean = true
) => {
  return new Promise(async (resolve, reject) => {
    chrome.downloads.download(options, (downloadId) => {
      if (chrome.runtime.lastError) {
        return reject(chrome.runtime.lastError);
      }
      if (!waitUntilCompleted) {
        return resolve("Tải xuống bắt đầu");
      } else {
        chrome.downloads.onChanged.addListener(function onDownloadChanged(
          downloadDelta
        ) {
          if (downloadDelta.id === downloadId && downloadDelta.state) {
            if (downloadDelta.state.current === "complete") {
              resolve("Tải xuống hoàn tất");
              chrome.downloads.onChanged.removeListener(onDownloadChanged);
            } else if (downloadDelta.state.current === "interrupted") {
              reject("Tải xuống bị gián đoạn");
              chrome.downloads.onChanged.removeListener(onDownloadChanged);
            }
          }
        });
      }
    });
  });
};

export const chromeUtils = {
  getChromeCookies,
  getStorage,
  setStorage,
  removeStorage,
  sendMessage,
  downloadFile,
};
