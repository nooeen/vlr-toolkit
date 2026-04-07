import { Module } from "@nestjs/common";
import { ShareModule } from "@app/share";
import { MongooseModule } from "@nestjs/mongoose";
import { ContentTierService } from "./contenttier.service";
import { ContentTierRepository } from "./contenttier.repository";
import { ContentTierModel, ContentTierSchema } from "./contenttier.schema";

@Module({
  imports: [
    ShareModule,
    MongooseModule.forFeature([
      {
        name: ContentTierModel.name,
        schema: ContentTierSchema,
        collection: "contenttiers",
      },
    ]),
  ],
  providers: [ContentTierService, ContentTierRepository],
  exports: [ContentTierService],
})
export class ContentTierModule {}
