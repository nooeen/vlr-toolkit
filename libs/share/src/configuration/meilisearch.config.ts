export type MeilisearchConfigType = {
  url: string;
  key: string;
};

export const buildMeilisearchConfig = (
  configKeymap = "meilisearch",
  configPrefix = "MEILISEARCH",
  configKeys = null
) => {
  let keys: { [x in keyof MeilisearchConfigType]: string } = {
    url: "URL",
    key: "KEY",
  };

  if (configPrefix != "") {
    for (const key in keys) {
      keys[key] = `${configPrefix}_${keys[key]}`;
    }
  }

  if (configKeys != null) {
    keys = configKeys;
  }

  const config = {};
  config[configKeymap] = {
    url: process.env[keys.url],
    key: process.env[keys.key],
  };

  return config;
};
