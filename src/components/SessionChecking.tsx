import { Spin } from "antd";
import axios from "axios";
import { FC, PropsWithChildren, useEffect, useState } from "react";
import { EStorageKey } from "src/constants/enum";
import { ICurrentUser } from "src/interfaces";
import useCurrentUserStore from "src/store/current-user";
import { chromeUtils } from "src/utils/chrome.util";

const SessionChecking: FC<PropsWithChildren> = ({ children }) => {
  const { setCurrentUser } = useCurrentUserStore();
  const [isCheckingSession, setIsCheckingSession] = useState(true);

  const checkingSession = async () => {
    try {
      const user = await chromeUtils.getStorage<ICurrentUser | null>(
        EStorageKey.USER
      );
      if (user) {
        const { data } = await axios.get(user.avatarUrl, {
          responseType: "blob",
          headers: {
            cookie: user.cookies,
          },
        });
        const avatarUrl = URL.createObjectURL(data);
        user.avatarUrl = avatarUrl;
        setCurrentUser(user);
      }
    } catch (error) {
    } finally {
      setIsCheckingSession(false);
    }
  };

  useEffect(() => {
    checkingSession();
  }, []);

  return isCheckingSession ? (
    <div className="h-screen flex items-center justify-center">
      <Spin />
    </div>
  ) : (
    children
  );
};

export default SessionChecking;
