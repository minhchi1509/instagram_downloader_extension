import { Typography } from "antd"
import { FacebookIcon, GithubIcon } from "src/assets/icons"

const Footer = () => {
  return (
    <div className="p-4 flex gap-2 mx-auto items-center">
      <Typography>
        Made by <span className="font-bold">minhchi1509</span>
      </Typography>
      <div className="flex gap-1 items-center">
        <a
          href="https://github.com/minhchi1509/instagram_downloader_extension"
          target="_blank">
          <GithubIcon className="size-6" />
        </a>
        <a href="https://facebook.com/minhchi1509" target="_blank">
          <FacebookIcon className="size-6" />
        </a>
      </div>
    </div>
  )
}

export default Footer
