import type { BrandId } from "./common";
import type { CameraId } from "./camera";

export type GuardId = BrandId<string, "GuardId">;

export type Guard = {
  id: GuardId;
  name: string;
  camera: CameraId;
};
