import axios from "axios";

const baseUrl = process.env.REACT_APP_API_BASE_URL;

const instance = axios.create({
  baseURL: baseUrl,
  timeout: 30000, // 30 secs
  headers: { "Content-Type": "application/json", Accept: "application/json" },
  validateStatus: function (status) {
    return (
      (status >= 200 && status < 300) ||
      status === 401 ||
      status === 403 ||
      status === 422 ||
      status === 400 ||
      status === 404
    );
  },
});

export async function post(url, paramObj = {}, config = {}) {
  return instance
    .post(url, paramObj, config)
    .then((response) => response?.data)
    .catch((error) => error.response?.data);
}

export async function put(url, paramObj = {}, config = {}) {
  return instance
    .put(url, paramObj, config)
    .then((response) => response?.data)
    .catch((error) => error.response?.data);
}

export async function patch(url, paramObj = {}, config = {}) {
  return instance
    .patch(url, paramObj, config)
    .then((response) => response?.data)
    .catch((error) => error.response?.data);
}

export async function get(url, config = {}) {
  return instance
    .get(url, config)
    .then((response) => response?.data)
    .catch((error) => error.response?.data);
}

export async function deleteM(url, config = {}) {
  return instance
    .delete(url, config)
    .then((response) => response?.data)
    .catch((error) => error.response?.data);
}
