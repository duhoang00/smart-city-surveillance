"use client";

import { use, useEffect, useRef, useState } from "react";
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
  const [alarms, setAlarms] = useState<AlarmMessage[]>([]);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    wsRef.current = initAlarmWS(guardId, (alarm: AlarmMessage) => {
      setAlarms((prev) => [...prev, alarm]);
    });

    return () => wsRef.current?.close();
  }, [guardId]);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [alarms]);

  return (
    <div className="p-4 h-screen flex flex-col">
      <h1 className="text-2xl font-bold mb-2">Guard {guardId} – Live Alarm Feed</h1>
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto bg-neutral-900 border border-neutral-700 p-4 rounded-md space-y-2"
      >
        {alarms.length === 0 && (
          <div className="text-neutral-400">No alarms yet...</div>
        )}

        {alarms.map((alarm, idx) => (
          <div
            key={idx}
            className="p-2 border-l-4 border-red-500 bg-neutral-800 rounded-md"
          >
            <div className="text-sm text-gray-300">
              <strong>Time:</strong> {new Date(alarm.timestamp || Date.now()).toLocaleString()}
            </div>
            <div className="text-white">
              <strong>Camera:</strong> {alarm.cameraId}
            </div>
            <div className="text-orange-300">
              <strong>Message:</strong> {alarm.message}
            </div>
            {alarm.message && (
              <div className="text-gray-400 text-sm mt-1">
                <strong>Message:</strong> {alarm.message}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
