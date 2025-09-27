import type { BrandId } from "./common";
import type { CameraId } from "./camera";
import { WithId } from "./common";

export type GuardId = BrandId<string, "GuardId">;

export type Guard = {
  id: GuardId;
  name: string;
  camera: CameraId;
};

export type GuardRef = WithId<Guard>;
