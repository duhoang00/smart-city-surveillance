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

export type BaseMessage = {
  guardId: string;
  message: string;
  timestamp: string;
};

export type AlarmMessage = BaseMessage & {
  type: "alarm";
  cameraId: string;
};

export type UpdateMessage = BaseMessage & {
  type: "update";
};

export type ActivityMessage = AlarmMessage | UpdateMessage;