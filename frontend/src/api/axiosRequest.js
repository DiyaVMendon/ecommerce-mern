
import axios from "axios";

export const base_url = "http://localhost:5001/api";

export const axiosRequest = (
  url,
  data = null,
  method = "GET",
  header = {},
  options = {}
) => {
  return axios({
    url: `${base_url}${url}`,
    method,
    data,
    headers: {
      ...header,
    },
    ...options,
  })
    .then((response) => {
      return response.data;
    })
    .catch((error) => {
      console.error(
        "API Error:",
        error.response?.data?.message || error.message
      );

      throw error;
    });
};
