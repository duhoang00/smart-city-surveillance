import { MessageKind } from "../enums";
import { ActivityMessage } from "../message";
import { AlarmMessage } from "../message";
import { UpdateMessage } from "../message";

export const isAlarmMessage = (msg: ActivityMessage): msg is AlarmMessage =>
  msg.type === MessageKind.Alarm;

export const isUpdateMessage = (msg: ActivityMessage): msg is UpdateMessage =>
  msg.type === MessageKind.Update;