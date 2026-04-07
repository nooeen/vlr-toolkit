import { RedisConfigType, buildRedisConfig } from "./redis.config";

export type MongoDBConfigType = {
  uri: string;
  cacheEnable: string | boolean;
  cache?: RedisConfigType | null;
};

export const buildMongoDBConfig = (
  configKeymap = "mongodb",
  configPrefix = "MONGODB",
  configKeys = null
) => {
  let keys: { [x in keyof MongoDBConfigType]: string } = {
    uri: "URI",
    cacheEnable: "CACHE_ENABLE",
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
    uri: process.env[keys.uri],
    cacheEnable: process.env[keys.cacheEnable],
  };

  if (config[configKeymap].cacheEnable) {
    config[configKeymap] = {
      ...config[configKeymap],
      ...buildRedisConfig("cache", "MONGODB_CACHE"),
    };
  }

  return config;
};
