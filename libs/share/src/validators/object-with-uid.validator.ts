import { Type } from "class-transformer";
import { IsNotEmpty, IsString } from "class-validator";

export type ObjectWithUidType = {
  uid: string;
};

export class ObjectWithUidDto implements ObjectWithUidType {
  @IsString()
  @IsNotEmpty()
  @Type(() => String)
  uid: string;
}
