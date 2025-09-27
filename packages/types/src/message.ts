import { GuardId } from "./guard";
import { MessageKind } from "./enums";
import { CameraId } from "./camera";

export type BaseMessage = {
  guardId: GuardId;
  message: string;
  timestamp: string;
};

export type AlarmMessage = BaseMessage & {
  type: MessageKind.Alarm;
  cameraId: CameraId;
};

export type UpdateMessage = BaseMessage & {
  type: MessageKind.Update;
};

export type ActivityMessage = AlarmMessage | UpdateMessage;

export type MessageByType = {
  [MessageKind.Alarm]: AlarmMessage;
  [MessageKind.Update]: UpdateMessage;
};

export type MessageType = keyof MessageByType;

export type ExtractMessage<T extends MessageType> = MessageByType[T];