export type RedisConfigType = {
  host: string;
  port: number;
  db: number;
  prefix: string;
  auth: boolean;
  password: string | null;
};

export const buildRedisConfig = (
  configKeymap = "redis",
  configPrefix = "REDIS",
  configKeys = null
) => {
  let keys: { [x in keyof RedisConfigType]: string } = {
    host: "HOST",
    port: "PORT",
    db: "DB",
    prefix: "PREFIX",
    auth: "AUTH",
    password: "PASSWORD",
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
    host: process.env[keys.host],
    port: parseInt(process.env[`${keys.port}`]),
    db: parseInt(process.env[`${keys.db}`]),
    prefix: process.env[`${keys.prefix}`],
    auth: process.env[`${keys.auth}`] == "true",
    password: process.env[keys.password],
  };

  return config;
};
