"use client";

import { useState, useEffect, useRef } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/shadcn/card";
import { Button } from "@repo/ui/components/shadcn/button";
import { Monitor } from "lucide-react"

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
  const wsRef = useRef<WebSocket | null>(null);

  // fetch available cameras
  useEffect(() => {
    fetch("http://localhost:8000/api/cameras")
      .then((res) => res.json())
      .then((data) => {
        setCameras(data);
        // default: pick first 4
        setSelected(data.slice(0, 4).map((c: Camera) => c.id));
      });
  }, []);

  // connect WebSocket
  useEffect(() => {
    if (selected.length === 0) return;

    const ws = new WebSocket("ws://localhost:8000/cctv");
    wsRef.current = ws;

    ws.onopen = () => {
      // tell backend which cameras we want
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

  return (
    <div className="p-6 space-y-6">
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

      {/* 2x2 Grid */}
      <Card className="bg-neutral-900 border-neutral-700">
        <CardContent>
          <div className="grid grid-cols-2 gap-4 p-4">
            {selected.length === 0 ? (
              <div className="col-span-2 gap-1 flex items-center justify-center h-[350px] text-gray-400 text-lg">
                <Monitor />
                <span>
                  Select a camera feed to get started
                </span>
              </div>
            ) : (
              selected.map((camId) => (
                <Card key={camId} className="bg-black">
                  <CardHeader>
                    <CardTitle className="text-white">
                      {cameras.find((c) => c.id === camId)?.name || camId}
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
    </div>
  );
}
