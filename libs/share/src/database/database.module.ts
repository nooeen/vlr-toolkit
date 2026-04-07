import { Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { MongooseModule } from "@nestjs/mongoose";
import { logExecutionTime } from "mongoose-execution-time";
import { applySpeedGooseCacheLayer } from "speedgoose";
import mongoose from "mongoose";
import { MongoDBConfigType } from "../configuration/mongodb.config";

@Module({
  imports: [
    MongooseModule.forRootAsync({
      useFactory: async (configService: ConfigService) => {
        mongoose.plugin(logExecutionTime);

        const mongoDBConfig = configService.get<MongoDBConfigType>("mongodb");

        if (
          mongoDBConfig.cacheEnable &&
          configService.get("NODE_ENV") === "production"
        ) {
          console.log("--------MongoDB Cache Enabled--------");
          await applySpeedGooseCacheLayer(mongoose, {
            redisOptions: {
              ...(mongoDBConfig.cache.prefix &&
                mongoDBConfig.cache.prefix.length && {
                  keyPrefix: `${mongoDBConfig.cache.prefix}_`,
                }),
            },
            redisUri: `redis://${
              mongoDBConfig.cache.auth
                ? `:${encodeURIComponent(mongoDBConfig.cache.password)}`
                : ""
            }@${mongoDBConfig.cache.host}:${mongoDBConfig.cache.port}/${
              mongoDBConfig.cache.db
            }`,
            debugConfig: {
              enabled: true,
            },
          });
        }
        return {
          uri: mongoDBConfig.uri,
        };
      },
      inject: [ConfigService],
    }),
  ],
})
export class DatabaseModule {}
