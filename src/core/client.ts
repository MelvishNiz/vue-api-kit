import axios, {AxiosError} from "axios";
import {nextTick} from "vue";

const client = (baseURL: string, headers: Record<string, string>, withCredentials: boolean) => {
  const client = axios.create({
    baseURL,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...headers,
    },
    withCredentials,
  });

  client.interceptors.request.use((config) => {
    if (!config.url) return config;

    // Replace path params for PUT requests
    if (config.method === "put" || (config.method === "post" && config.data)) {
      const {params = {}, ...body} = config.data;
      config.data = body;
      Object.entries(params).forEach(([key, value]) => {
        const token = `{${key}}`;
        if (config.url?.includes(token)) {
          config.url = config.url.replace(token, encodeURIComponent(String(value)));
        }
      });
    }

    // Replace path params for other methods using config.params
    if (config.params) {
      Object.entries(config.params).forEach(([key, value]) => {
        const token = `{${key}}`;
        if (config.url?.includes(token)) {
          config.url = config.url.replace(token, encodeURIComponent(String(value)));
          delete config.params[key];
        }
      });
    }

    return config;
  });

  client.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
      nextTick(() => {
        if (error.code === "ERR_CANCELED") return;
      });

      return Promise.reject(error);
    },
  );

  return client;
};

export default client;