import * as Joi from "joi";
import { HOST_SCHEMA } from "@app/share/configuration/schemas/common.schema";
import { redisConfigSchema } from "@app/share/configuration/schemas/redis.schema";
import { MongoDBConfigType } from "@app/share/configuration/mongodb.config";

export function mongodbConfigSchema(
  required = false,
  configPrefix = "MONGODB",
  configKeys = null
) {
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

  const schema = {};
  schema[`${configPrefix}_URI`] = HOST_SCHEMA.default(
    "mongodb://admin:example@localhost:27017/db"
  );
  schema[`${configPrefix}_CACHE_ENABLE`] = Joi.boolean().default(false);

  if (required) {
    for (const key in schema) {
      schema[key] = schema[key].required();
    }
  }

  return {
    ...schema,
    ...(process.env[`${configPrefix}_CACHE_ENABLE`] == "true" &&
      redisConfigSchema(required, `${configPrefix}_CACHE`)),
  };
}
