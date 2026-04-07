import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { Types } from "mongoose";

@Schema({
  timestamps: {
    createdAt: "created_at",
    updatedAt: "updated_at",
  },
  versionKey: false,
})
export class SkinModel {
  _id: Types.ObjectId;

  @Prop({ type: String, unique: true, index: true })
  public uuid: string;

  @Prop({ type: String, required: true })
  public displayName: string;

  @Prop({ type: String })
  public themeUuid: string;

  @Prop({ type: String })
  public contentTierUuid: string;

  @Prop({ type: String })
  public displayIcon: string;

  @Prop({ type: String, default: null })
  public wallpaper: string;

  @Prop({ type: String })
  public assetPath: string;

  @Prop({ type: Array })
  public chromas: {
    uuid: string;
    displayName: string;
    displayIcon: string;
    fullRender: string;
    swatch: string;
    streamedVideo: string;
    assetPath: string;
  }[];

  @Prop({ type: Array })
  public levels: {
    uuid: string;
    displayName: string;
    levelItem: string;
    displayIcon: string;
    streamedVideo: string;
    assetPath: string;
  }[];

  @Prop()
  public updated_at: number;

  @Prop()
  public created_at: number;
}

export type SkinDocument = SkinModel & mongoose.Document;
const schema = SchemaFactory.createForClass(SkinModel);

schema.pre("save", function (this: SkinModel, next) {
  this.updated_at = Date.now();
  next();
});
schema.loadClass(SkinModel);

export const SkinSchema = schema;
