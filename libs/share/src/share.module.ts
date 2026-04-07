import { Module } from "@nestjs/common";
// import { DevtoolsModule } from "@nestjs/devtools-integration";
import { ThrottlerModule, seconds } from "@nestjs/throttler";
import { ShareService } from "./share.service";
import { CacheModule } from "./cache/cache.module";
import { DatabaseModule } from "./database/database.module";
import { ConfigurationModule } from "./configuration/configuration.module";
import { CacheService } from "./cache/cache.service";
import { QueueModule } from "./queue/queue.module";
import { ScheduleModule } from "@nestjs/schedule";

@Module({
  imports: [
    // DevtoolsModule.register({ http: true }),
    ConfigurationModule,
    CacheModule,
    DatabaseModule,
    QueueModule,
    ScheduleModule.forRoot(),
    ThrottlerModule.forRoot([
      {
        ttl: seconds(60),
        limit: 10,
      },
    ]),
  ],
  providers: [ShareService, CacheService],
  exports: [ShareService, CacheService],
})
export class ShareModule {}
