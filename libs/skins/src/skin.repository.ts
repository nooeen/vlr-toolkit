import { Injectable } from "@nestjs/common";
import { BaseRepositoryAbstract } from "@app/share/database/base.repository.abstract";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { BaseRepositoryInterface } from "@app/share/database/base.repository.interface";
import { SkinModel } from "./skin.schema";

export type SkinRepositoryInterface = BaseRepositoryInterface<SkinModel>;

@Injectable()
export class SkinRepository
  extends BaseRepositoryAbstract<SkinModel>
  implements SkinRepositoryInterface
{
  constructor(
    @InjectModel(SkinModel.name)
    private readonly skinModel: Model<SkinModel>
  ) {
    super(skinModel);
  }
}
