import { Module } from "@nestjs/common";
import { ShareModule } from "@app/share";
import { MongooseModule } from "@nestjs/mongoose";
import { SkinService } from "./skin.service";
import { SkinRepository } from "./skin.repository";
import { SkinModel, SkinSchema } from "./skin.schema";

@Module({
  imports: [
    ShareModule,
    MongooseModule.forFeature([
      {
        name: SkinModel.name,
        schema: SkinSchema,
        collection: "skins",
      },
    ]),
  ],
  providers: [SkinService, SkinRepository],
  exports: [SkinService],
})
export class SkinModule {}
