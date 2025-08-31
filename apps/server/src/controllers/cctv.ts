import { WebSocketServer, WebSocket } from "ws";
import ffmpeg from "fluent-ffmpeg";
import { PassThrough } from "stream";
import { Server } from "http";

import { mockCameras } from "../mocks";

const subscriptions = new Map<WebSocket, string[]>();

export const initCCTV = (server: Server) => {
  const wss = new WebSocketServer({ server, path: "/cctv" });

  wss.on("connection", (ws) => {
    console.log("WebSocket client connected");

    ws.on("message", (msg) => {
      try {
        const data = JSON.parse(msg.toString());
        if (data.action === "subscribe" && Array.isArray(data.cameraIds)) {
          subscriptions.set(ws, data.cameraIds);
          console.log("Subscribed cameras:", data.cameraIds);
        }
      } catch (err) {
        console.error("Invalid message", err);
      }
    });

    ws.on("close", () => {
      subscriptions.delete(ws);
      console.log("WebSocket client disconnected");
    });
  });

  // Start streams for all mock cameras
  mockCameras.forEach((cam) => {
    if (cam.file) {
      startVideoStream(cam.id, cam.file);
    }
  });
};

// --- Helper: stream video frames for each camera ---
function startVideoStream(camId: string, file: string) {
  const loop = () => {
    const stream = new PassThrough();

    ffmpeg(file)
      .inputOptions(["-re"])
      .outputOptions([
        "-vf", "fps=2,scale=640:-1",
        "-update", "1",
        "-q:v", "5",
      ])
      .format("image2pipe")
      .output(stream)
      .on("end", () => setTimeout(loop, 100))
      .on("error", (err) => {
        console.error(`${camId} stream error:`, err.message);
        setTimeout(loop, 2000);
      })
      .run();

    let buffer: Buffer[] = [];
    stream.on("data", (chunk) => {
      buffer.push(chunk);
      if (chunk.toString("hex", 0, 2) === "ffd8") {
        const frame = Buffer.concat(buffer);
        buffer = [];

        const base64 = frame.toString("base64");

        for (const [ws, subscribedCams] of subscriptions.entries()) {
          if (ws.readyState !== WebSocket.OPEN) continue;
          if (subscribedCams.includes(camId)) {
            ws.send(JSON.stringify({ cameraId: camId, frame: base64 }));
          }
        }
      }
    });
  };

  loop();
}
