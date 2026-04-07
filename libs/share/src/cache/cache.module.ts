import { Module } from "@nestjs/common";
import { RedisModule } from "@nestjs-modules/ioredis";
import { ConfigService } from "@nestjs/config";
import { CacheService } from "./cache.service";
import { RedisConfigType } from "../configuration/redis.config";

@Module({
  imports: [
    RedisModule.forRootAsync({
      useFactory: (configService: ConfigService) => {
        const redisConfig = configService.get<RedisConfigType>("redis");

        return {
          type: "single",
          url: `redis://${redisConfig.auth ? `:${redisConfig.password}` : ""}@${
            redisConfig.host
          }:${redisConfig.port}`,
          options: {
            db: redisConfig.db,
            ...(redisConfig.prefix &&
              redisConfig.prefix.length && {
                keyPrefix: `${redisConfig.prefix}_`,
              }),
          },
        };
      },
      inject: [ConfigService],
    }),
  ],
  providers: [CacheService],
  exports: [CacheService],
})
export class CacheModule {}
