import axios from "axios";
import useCurrentUserStore from "src/store/current-user";

const axiosInstance = axios.create({
  baseURL: "https://www.instagram.com/graphql/query",
  headers: { cookie: useCurrentUserStore.getState().currentUser?.cookies },
});

export default axiosInstance;
