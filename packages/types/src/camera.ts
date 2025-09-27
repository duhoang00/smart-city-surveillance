import type { BrandId } from "./common";
import { WithId } from "./common";

export type CameraId = BrandId<string, "CameraId">;

export type Camera = {
  id: CameraId;
  name: string;
  file: string;
};

export type CameraFrame = {
  cameraId: CameraId;
  frame: string;
};

export type CameraRef = WithId<Camera>;
