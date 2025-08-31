export type GuardNotification = {
  id: string;
  guardId: string;
  cameraId: string;
  timestamp: string;
  title: string;
  message: string;
  severity: "low" | "medium" | "high" | "critical";
  meta?: any;
};
