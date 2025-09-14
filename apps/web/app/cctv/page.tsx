"use client";

import { useState, useEffect, useRef } from "react";
import { Monitor, Siren } from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/shadcn/card";
import { Button } from "@repo/ui/components/shadcn/button";
import { ActivityMessage } from "@repo/types"

type Camera = {
  id: string;
  name: string;
};

type CameraFrame = {
  cameraId: string;
  frame: string;
};

export default function CCTVPage() {
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [frames, setFrames] = useState<Record<string, string>>({});
  const [logs, setLogs] = useState<ActivityMessage[]>([]);

  const cctvWSRef = useRef<WebSocket | null>(null);
  const operatorWSRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/cameras`)
      .then((res) => res.json())
      .then((data) => {
        setCameras(data);
        // default: pick first 4
        setSelected(data.slice(0, 4).map((c: Camera) => c.id));
      });
  }, []);


  useEffect(() => {
    if (selected.length === 0) return;
    const ws = new WebSocket(`${process.env.NEXT_PUBLIC_WS_URL}/cctv`);
    cctvWSRef.current = ws;
    ws.onopen = () => {
      ws.send(JSON.stringify({ action: "subscribe", cameraIds: selected }));
    };
    ws.onmessage = (event) => {
      const data: CameraFrame = JSON.parse(event.data);
      setFrames((prev) => ({
        ...prev,
        [data.cameraId]: `data:image/jpeg;base64,${data.frame}`,
      }));
    };
    return () => {
      ws.close();
    };
  }, [selected]);

  useEffect(() => {
    const ws = new WebSocket(`${process.env.NEXT_PUBLIC_WS_URL}/operator`);
    operatorWSRef.current = ws;

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.type === "alarm" || data.type === "update") {
        setLogs((prev) => [
          ...prev,
          {
            type: data.type,
            cameraId: data.cameraId,
            guardId: data.guardId,
            message: data.message || data.text || "",
            timestamp: new Date(data.timestamp || Date.now()).toLocaleString(),
          },
        ]);
      }
    };

    return () => ws.close();
  }, []);

  const sendAlarm = (camId: string) => {
    if (operatorWSRef.current) {
      operatorWSRef.current.send(
        JSON.stringify({
          type: "alarm",
          cameraId: camId,
          message: `🚨 Alarm triggered for: ${camId}`,
          timestamp: new Date().toISOString(),
        })
      );
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-wider">CCTV</h1>
      </div>

      {/* Camera selection */}
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-sm text-neutral-400">Select up to 4 cameras:</span>
        <div className="flex flex-wrap gap-2">
          {cameras.map((cam) => {
            const isActive = selected.includes(cam.id);
            return (
              <Button
                key={cam.id}
                variant={isActive ? "default" : "outline"}
                className={`transition-colors ${isActive
                  ? "bg-orange-500 text-white hover:bg-orange-600"
                  : "text-neutral-400 hover:bg-neutral-800 hover:text-white"
                  }`}
                onClick={() => {
                  setSelected((prev) =>
                    prev.includes(cam.id)
                      ? prev.filter((id) => id !== cam.id)
                      : [...prev, cam.id].slice(-4) // max 4
                  );
                }}
              >
                {cam.name}
              </Button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-12 gap-4">
        {/* 2x2 Grid */}
        <Card className="col-span-8 bg-neutral-900 border-neutral-700">
          <CardContent>
            <div className="grid grid-cols-2 gap-4 p-4">
              {selected.length === 0 ? (
                <div className="col-span-2 gap-1 flex items-center justify-center h-[350px] text-gray-400 text-lg">
                  <Monitor />
                  <span>Select a camera feed to get started</span>
                </div>
              ) : (
                selected.map((camId) => (
                  <Card key={camId} className="bg-black">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center justify-between">
                        {cameras.find((c) => c.id === camId)?.name || camId}
                        <Button
                          variant="ghost"
                          className="text-orange-500 hover:text-red-600"
                          onClick={() => sendAlarm(camId)}
                        >
                          <Siren />
                        </Button>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="flex items-center justify-center h-[350px]">
                      {frames[camId] ? (
                        <img
                          src={frames[camId]}
                          alt={camId}
                          className="object-contain w-full h-full"
                        />
                      ) : (
                        <span className="text-gray-400">Loading...</span>
                      )}
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Activity Log */}
        <Card className="col-span-4 bg-neutral-900 border-neutral-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-neutral-300 tracking-wider">
              ACTIVITY LOG
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {logs.length === 0 ? (
                <div className="text-neutral-500 text-xs italic">No activity yet...</div>
              ) : (
                logs.map((log, index) => (
                  <div
                    key={index}
                    className="text-xs border-l-2 border-orange-500 pl-3 hover:bg-neutral-800 p-2 rounded transition-colors"
                  >
                    <div className="text-neutral-500 font-mono">{log.timestamp}</div>
                    <div className="text-white">
                      {log.type === "alarm" ? (
                        <>
                          <span className="text-orange-500 font-mono">ALARM</span>{" "}
                          triggered for camera{" "}
                          <span className="text-white font-mono">{log.cameraId}</span>:{" "}
                          {log.message}
                        </>
                      ) : (
                        <>
                          Update from{" "}
                          <span className="text-orange-500 font-mono">
                            Guard {log.guardId}
                          </span>
                          : {log.text}
                        </>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
