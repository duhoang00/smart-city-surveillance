"use client";

import { use, useEffect, useRef } from "react";
import { AlarmMessage } from "@repo/types";

const initAlarmWS = (
  guardId: string,
  onAlarm: (alarm: AlarmMessage) => void
) => {
  console.log("🌍 guardId", guardId);

  const ws = new WebSocket(
    `${process.env.NEXT_PUBLIC_WS_URL}/alarm?id=${guardId}`
  );

  ws.onopen = () => {
    console.log(`✅ Guard ${guardId} connected to alarm channel`);
  };

  ws.onmessage = (event) => {
    try {
      const data: AlarmMessage = JSON.parse(event.data);
      if (data.type === "alarm") {
        onAlarm(data);
      }
    } catch (err) {
      console.error("❌ Error parsing alarm message:", err);
    }
  };

  ws.onclose = () => {
    console.log(`❌ Guard ${guardId} disconnected`);
  };

  return ws;
};

export default function GuardPage({ params }: { params: Promise<{ guardId: string }> }) {
  const { guardId } = use(params); 
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    wsRef.current = initAlarmWS(guardId, (alarm: AlarmMessage) => {
      console.log("🚨 Alarm received:", alarm);
      alert(`ALARM for ${alarm.cameraId}: ${alarm.message}`);
    });

    return () => {
      wsRef.current?.close();
    };
  }, [guardId]);

  return <div>Guard {guardId} listening for alarms...</div>;
}
