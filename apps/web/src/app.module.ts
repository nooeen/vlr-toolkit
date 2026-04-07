import { Module, MiddlewareConsumer } from "@nestjs/common";
import { ServeStaticModule } from "@nestjs/serve-static";
import { ScheduleModule } from "@nestjs/schedule";
import { ShareModule } from "@app/share";
import { SkinModule } from "libs/skins/src";
import { ContentTierModule } from "libs/contenttiers/src";
import { join } from "path";
import { MiddlewareService } from "./services/middleware.service";
import { CronService } from "./services/cron.service";
import { InventoryService } from "./services/inventory.service";
import { IndexController } from "./controllers/index.controller";

@Module({
  imports: [
    ShareModule,
    ScheduleModule.forRoot(),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, "..", "..", "..", "public"),
      serveRoot: "/",
      serveStaticOptions: {
        cacheControl: true,
        etag: true,
        maxAge: "30d",
      },
    }),
    SkinModule,
    ContentTierModule,
  ],
  controllers: [IndexController],
  providers: [CronService, InventoryService],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(MiddlewareService).forRoutes("*");
  }
}
