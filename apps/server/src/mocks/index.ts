import path from "path";

import { Camera, Guard } from "@repo/types";

export const mockCameras: Camera[] = [
  { id: "cam1", name: "Camera 1", file: path.join(__dirname, "cam1.mp4") },
  { id: "cam2", name: "Camera 2", file: path.join(__dirname, "cam2.mp4") },
  { id: "cam3", name: "Camera 3", file: path.join(__dirname, "cam3.mp4") },
  { id: "cam4", name: "Camera 4", file: path.join(__dirname, "cam4.mp4") },
  { id: "cam5", name: "Camera 5", file: path.join(__dirname, "cam5.mp4") },
  { id: "cam6", name: "Camera 6", file: path.join(__dirname, "cam6.mp4") },
  { id: "cam7", name: "Camera 7", file: path.join(__dirname, "cam7.mp4") },
];

export const mockGuards: Guard[] = [
  { id: "guard1", name: "Guard 1", camera: "cam1" },
  { id: "guard2", name: "Guard 2", camera: "cam2" },
  { id: "guard3", name: "Guard 3", camera: "cam3" },
  { id: "guard4", name: "Guard 4", camera: "cam4" },
  { id: "guard5", name: "Guard 5", camera: "cam5" },
  { id: "guard6", name: "Guard 6", camera: "cam6" },
  { id: "guard7", name: "Guard 7", camera: "cam7" },
]