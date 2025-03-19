import { Button } from "antd"
import axios from "axios"
import { useState } from "react"
import { AppLogo } from "src/assets/images"
import { EStorageKey } from "src/constants/enum"
import { getCurrentUserInfor } from "src/services"
import useCurrentUserStore from "src/store/current-user"
import { chromeUtils } from "src/utils/chrome.util"
import { showErrorToast } from "src/utils/toast.util"

const UnAuthorizedPage = () => {
  const { setCurrentUser } = useCurrentUserStore()
  const [isSigningIn, setIsSigningIn] = useState(false)

  const handleLogin = async () => {
    setIsSigningIn(true)
    try {
      const cookies = await chromeUtils.getChromeCookies("instagram.com")
      console.log("Cookies", cookies)

      const axiosInstance = axios.create({
        baseURL: "https://www.instagram.com/graphql/query",
        headers: { cookie: cookies }
      })
      const profileInfor = await getCurrentUserInfor(axiosInstance)
      console.log("Profile infor", profileInfor)

      const { data } = await axiosInstance.get(profileInfor.avatarUrl, {
        responseType: "blob",
        headers: { cookie: cookies }
      })
      const avatarUrl = URL.createObjectURL(data)
      await chromeUtils.setStorage(EStorageKey.USER, {
        ...profileInfor,
        cookies
      })
      setCurrentUser({ ...profileInfor, cookies, avatarUrl })
    } catch (error) {
      showErrorToast(
        "Đăng nhập thất bại. Hãy đảm bảo bạn đã đăng nhập vào Instagram trên trình duyệt"
      )
      console.log("Error", error)
    } finally {
      setIsSigningIn(false)
    }
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center">
      <img className="size-16 rounded-2xl overflow-hidden" src={AppLogo} />
      <h1 className="font-bold mt-5 text-4xl">Trình tải xuống Instagram</h1>
      <Button
        type="primary"
        className="mt-5"
        loading={isSigningIn}
        onClick={handleLogin}>
        Đăng nhập
      </Button>
    </div>
  )
}

export default UnAuthorizedPage
