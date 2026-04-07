import { MaybeType } from "@app/share/types/maybe.type";
import { TransformFnParams } from "class-transformer/types/interfaces";

export const lowerCaseTransformer = (
  params: TransformFnParams
): MaybeType<string> => params.value?.toLowerCase().trim();
