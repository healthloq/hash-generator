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

export async function post(url, paramObj = {}, config = {}) {
  //   const { token } = utils.getLocalStorageItems();
  //   instance.defaults.headers.common["x-access-token"] = token;

  return instance
    .post(url, paramObj, config)
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

export async function put(url, paramObj = {}, config = {}) {
  return instance
    .put(url, paramObj, config)
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

export async function patch(url, paramObj = {}, config = {}) {
  return instance
    .patch(url, paramObj, config)
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

export async function get(url, config = {}) {
  return instance
    .get(url, config)
    .then((response) => {
      return response?.data;
    })
    .catch((error) => {
      return error.response.data;
    });
}

export async function deleteM(url, config = {}) {
  return instance
    .delete(url, config)
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

export async function healthloqPost(url, paramObj = {}, config = {}) {
  instance.defaults.headers.common["Authorization"] =
    process.env.REACT_APP_JWT_TOKEN;

  return healthloqInstance
    .post(url, paramObj, config)
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

export async function healthloqPut(url, paramObj = {}, config = {}) {
  instance.defaults.headers.common["Authorization"] =
    process.env.REACT_APP_JWT_TOKEN;
  return healthloqInstance
    .put(url, paramObj, config)
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

export async function healthloqPatch(url, paramObj = {}, config = {}) {
  instance.defaults.headers.common["Authorization"] =
    process.env.REACT_APP_JWT_TOKEN;
  return healthloqInstance
    .patch(url, paramObj, config)
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

export async function healthloqGet(url, config = {}) {
  instance.defaults.headers.common["Authorization"] =
    process.env.REACT_APP_JWT_TOKEN;
  return healthloqInstance
    .get(url, config)
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

export async function healthloqDelete(url, config = {}) {
  instance.defaults.headers.common["Authorization"] =
    process.env.REACT_APP_JWT_TOKEN;
  return healthloqInstance
    .delete(url, config)
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
