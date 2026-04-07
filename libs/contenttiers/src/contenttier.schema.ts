import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { Types } from "mongoose";

@Schema({
  timestamps: {
    createdAt: "created_at",
    updatedAt: "updated_at",
  },
  versionKey: false,
})
export class ContentTierModel {
  _id: Types.ObjectId;

  @Prop({ type: String, unique: true, index: true })
  public uuid: string;

  @Prop({ type: String, required: true })
  public displayName: string;

  @Prop({ type: String, required: true })
  public devName: string;

  @Prop({ type: Number, required: true })
  public rank: number;

  @Prop({ type: Number, required: true })
  public juiceValue: number;

  @Prop({ type: Number, required: true })
  public juiceCost: number;

  @Prop({ type: String, required: true })
  public highlightColor: string;

  @Prop({ type: String })
  public displayIcon: string;

  @Prop({ type: String })
  public assetPath: string;

  @Prop()
  public updated_at: number;

  @Prop()
  public created_at: number;
}

export type ContentTierDocument = ContentTierModel & mongoose.Document;
const schema = SchemaFactory.createForClass(ContentTierModel);

schema.pre("save", function (this: ContentTierModel, next) {
  this.updated_at = Date.now();
  next();
});
schema.loadClass(ContentTierModel);

export const ContentTierSchema = schema;
