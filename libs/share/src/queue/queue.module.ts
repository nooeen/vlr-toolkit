import { Module } from "@nestjs/common";
import { BullModule } from "@nestjs/bull";
import { ConfigService } from "@nestjs/config";
import { RedisConfigType } from "../configuration/redis.config";

@Module({
  imports: [
    BullModule.forRootAsync({
      useFactory: (configService: ConfigService) => {
        const queueConfig = configService.get<RedisConfigType>("queue");

        return {
          redis: {
            host: queueConfig.host,
            port: queueConfig.port,
            ...(queueConfig.auth && {
              password: queueConfig.password,
            }),
            db: Number(queueConfig.db),
          },
          prefix: queueConfig.prefix,
        };
      },
      inject: [ConfigService],
    }),
  ],
  providers: [],
  exports: [],
})
export class QueueModule {}
