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
    ); // default
  },
});

const healthloqBaseURL = process.env.REACT_APP_HEALTHLOQ_API_BASE_URL;

const healthloqInstance = axios.create({
  baseURL: healthloqBaseURL,
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
    ); // default
  },
});

export async function post(url, paramObj = {}, headers = {}) {
  //   const { token } = utils.getLocalStorageItems();
  //   instance.defaults.headers.common["x-access-token"] = token;

  return instance
    .post(url, paramObj)
    .then((response) => {
      return response?.data;
    })
    .then((response) => {
      return response;
    })
    .catch((error) => {
      return error.response.data;
    });
}

export async function put(url, paramObj = {}, headers = {}) {
  return instance
    .put(url, paramObj)
    .then((response) => {
      return response?.data;
    })
    .then((response) => {
      return response;
    })
    .catch((error) => {
      return error.response.data;
    });
}

export async function patch(url, paramObj = {}, headers = {}) {
  return instance
    .patch(url, paramObj)
    .then((response) => {
      return response?.data;
    })
    .then((response) => {
      return response;
    })
    .catch((error) => {
      return error.response.data;
    });
}

export async function get(url, paramObj = {}, headers = {}) {
  return instance
    .get(url, { params: paramObj })
    .then((response) => {
      return response?.data;
    })
    .catch((error) => {
      return error.response.data;
    });
}

export async function deleteM(url, payload = {}, headers = {}) {
  return instance
    .delete(url, { data: payload })
    .then((response) => {
      return response?.data;
    })
    .then((response) => {
      return response;
    })
    .catch((error) => {
      return error.response.data;
    });
}

export async function healthloqPost(url, paramObj = {}, headers = {}) {
  instance.defaults.headers.common["Authorization"] =
    process.env.REACT_APP_JWT_TOKEN;

  return healthloqInstance
    .post(url, paramObj)
    .then((response) => {
      return response?.data;
    })
    .then((response) => {
      return response;
    })
    .catch((error) => {
      return error.response.data;
    });
}

export async function healthloqPut(url, paramObj = {}, headers = {}) {
  instance.defaults.headers.common["Authorization"] =
    process.env.REACT_APP_JWT_TOKEN;
  return healthloqInstance
    .put(url, paramObj)
    .then((response) => {
      return response?.data;
    })
    .then((response) => {
      return response;
    })
    .catch((error) => {
      return error.response.data;
    });
}

export async function healthloqPatch(url, paramObj = {}, headers = {}) {
  instance.defaults.headers.common["Authorization"] =
    process.env.REACT_APP_JWT_TOKEN;
  return healthloqInstance
    .patch(url, paramObj)
    .then((response) => {
      return response?.data;
    })
    .then((response) => {
      return response;
    })
    .catch((error) => {
      return error.response.data;
    });
}

export async function healthloqGet(url, paramObj = {}, headers = {}) {
  instance.defaults.headers.common["Authorization"] =
    process.env.REACT_APP_JWT_TOKEN;
  return healthloqInstance
    .get(url, { params: paramObj })
    .then((response) => {
      return response?.data;
    })
    .then((response) => {
      return response;
    })
    .catch((error) => {
      return error.response.data;
    });
}

export async function healthloqDelete(url, payload = {}, headers = {}) {
  instance.defaults.headers.common["Authorization"] =
    process.env.REACT_APP_JWT_TOKEN;
  return healthloqInstance
    .delete(url, { data: payload })
    .then((response) => {
      return response?.data;
    })
    .then((response) => {
      return response;
    })
    .catch((error) => {
      return error.response.data;
    });
}
