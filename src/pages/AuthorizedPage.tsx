import { Tabs, TabsProps } from "antd";
import DownloadAll from "src/components/tabs/DownloadAll";
import DownloadSeparately from "src/components/tabs/DownloadSeparately";

import Header from "src/layouts/Header";

const AuthorizedPage = () => {
  const tabItems: TabsProps["items"] = [
    {
      key: "1",
      label: "Tải xuống hàng loạt",
      children: <DownloadAll />,
    },
    {
      key: "2",
      label: "Tải xuống riêng lẻ",
      children: <DownloadSeparately />,
    },
  ];

  return (
    <div className="flex-1 w-full max-w-[1400px] mx-auto px-4 xl:px-0">
      <Header />
      <div className="mt-5 bg-white shadow-md rounded-2xl p-3 px-5">
        <Tabs items={tabItems} defaultActiveKey="1" />
      </div>
    </div>
  );
};

export default AuthorizedPage;
