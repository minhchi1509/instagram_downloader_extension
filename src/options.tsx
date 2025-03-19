import { StyleProvider } from "@ant-design/cssinjs"
import { Toaster } from "sonner"
import SessionChecking from "src/components/SessionChecking"
import Footer from "src/layouts/Footer"
import AuthorizedPage from "src/pages/AuthorizedPage"
import UnAuthorizedPage from "src/pages/UnAuthorizedPage"
import useCurrentUserStore from "src/store/current-user"

import "./style.css"

import { ConfigProvider } from "antd"

const Options = () => {
  const { currentUser } = useCurrentUserStore()
  return (
    <ConfigProvider>
      <StyleProvider hashPriority="high">
        <div className="bg-zinc-50 w-full min-h-screen">
          <SessionChecking>
            <div className="min-h-screen flex flex-col">
              {currentUser ? <AuthorizedPage /> : <UnAuthorizedPage />}
              <Footer />
            </div>
          </SessionChecking>
          <Toaster />
        </div>
      </StyleProvider>
    </ConfigProvider>
  )
}

export default Options
