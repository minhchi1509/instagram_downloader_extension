import { Avatar, Dropdown, MenuProps, Popconfirm, Typography } from "antd"
import { useState } from "react"
import { LogoutIcon } from "src/assets/icons"
import { AppLogo } from "src/assets/images"
import { EStorageKey } from "src/constants/enum"
import useCurrentUserStore from "src/store/current-user"
import { chromeUtils } from "src/utils/chrome.util"

const Header = () => {
  const [isSignOut, setIsSignOut] = useState(false)
  const { currentUser, setCurrentUser } = useCurrentUserStore()

  const handleLogout = async () => {
    setIsSignOut(true)
    URL.revokeObjectURL(currentUser?.avatarUrl || "")
    await chromeUtils.removeStorage(EStorageKey.USER)
    setCurrentUser(null)
    setIsSignOut(false)
  }

  const userMenu: MenuProps["items"] = [
    {
      key: "1",
      label: (
        <Popconfirm
          title="Bạn có chắc chắn muốn đăng xuất?"
          onConfirm={handleLogout}
          okText="Đăng xuất"
          cancelText="Hủy"
          okButtonProps={{ loading: isSignOut }}
          placement="bottomRight">
          <div
            className="flex items-center gap-2 cursor-pointer"
            onClick={(e) => e.stopPropagation()}>
            <LogoutIcon className="size-[14px]" />
            <p>Đăng xuất</p>
          </div>
        </Popconfirm>
      )
    }
  ]

  return (
    <div className="mt-8 bg-white flex items-center p-3 rounded-2xl shadow-md justify-between">
      <div className="flex items-center gap-2">
        <img className="size-12 rounded-xl overflow-hidden" src={AppLogo} />
        <p className="font-bold text-lg">Trình tải xuống Instagram</p>
      </div>
      <div className="flex items-center gap-2">
        <Typography>
          Xin chào{" "}
          <span className="font-bold">
            {currentUser?.username || "minhchi1509"}
          </span>
        </Typography>
        <Dropdown
          menu={{ items: userMenu }}
          trigger={["click"]}
          placement="bottomRight">
          <Avatar
            size={30}
            src={currentUser?.avatarUrl}
            className="cursor-pointer"
          />
        </Dropdown>
      </div>
    </div>
  )
}

export default Header
