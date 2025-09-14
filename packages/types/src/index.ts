export type Camera = {
  id: string;
  name: string;
  file: string;
}

export type Guard = {
  id: string;
  name: string;
  camera: string;
}

export type AlarmMessage = {
  type: "alarm";
  cameraId: string;
  message: string;
};