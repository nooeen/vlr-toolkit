import { Injectable } from "@nestjs/common";
import { BaseRepositoryAbstract } from "@app/share/database/base.repository.abstract";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { BaseRepositoryInterface } from "@app/share/database/base.repository.interface";
import { ContentTierModel } from "./contenttier.schema";

export type ContentTierRepositoryInterface = BaseRepositoryInterface<ContentTierModel>;

@Injectable()
export class ContentTierRepository
  extends BaseRepositoryAbstract<ContentTierModel>
  implements ContentTierRepositoryInterface
{
  constructor(
    @InjectModel(ContentTierModel.name)
    private readonly contentTierModel: Model<ContentTierModel>
  ) {
    super(contentTierModel);
  }
}
