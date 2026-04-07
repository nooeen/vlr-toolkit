import * as Joi from "joi";
import {
  HOST_SCHEMA,
  PORT_SCHEMA,
} from "@app/share/configuration/schemas/common.schema";
import { RedisConfigType } from "@app/share/configuration/redis.config";

export function redisConfigSchema(
  required = false,
  configPrefix = "REDIS",
  configKeys = null
) {
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

  const schema = {};
  schema[`${keys.host}`] = HOST_SCHEMA.default("localhost");
  schema[`${keys.port}`] = PORT_SCHEMA.default(6379);
  schema[`${keys.db}`] = Joi.number().default(1);
  schema[`${keys.prefix}`] = Joi.string().default("");
  schema[`${keys.auth}`] = Joi.boolean().default(false);
  schema[`${keys.password}`] = Joi.string().allow(null, "").default("example");

  if (required) {
    for (const key in schema) {
      schema[key] = schema[key].required();
    }
  }

  return schema;
}
