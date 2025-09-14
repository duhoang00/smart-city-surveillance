import { Server } from "http";
import { parse } from "url";
import { WebSocketServer, WebSocket } from "ws";

import { mockCameras } from "../mocks";
import { startVideoStream } from "./cctv";

export const subscriptions = new Map<WebSocket, string[]>();
export const guardClients: Record<string, WebSocket[]> = {};

export const initSockets = (server: Server) => {
  const wss = new WebSocketServer({ noServer: true });

  server.on("upgrade", (req, socket, head) => {
    wss.handleUpgrade(req, socket, head, (ws) => {
      wss.emit("connection", ws, req);
    });
  });

  wss.on("connection", (ws, req) => {
    const { pathname, query } = parse(req.url || "", true);
    console.log("🍿 pathname", pathname);

    if (pathname === "/cctv") {
      console.log("✅ CCTV client connected");

      ws.on("message", (msg) => {
        try {
          const data = JSON.parse(msg.toString());
          if (data.action === "subscribe" && Array.isArray(data.cameraIds)) {
            subscriptions.set(ws, data.cameraIds);
            console.log("Subscribed cameras:", data.cameraIds);
          }
        } catch (err) {
          console.error("Invalid CCTV message", err);
        }
      });

      ws.on("close", () => {
        subscriptions.delete(ws);
        console.log("❌ CCTV websocket disconnected");
      });

    } else if (pathname === "/alarm") {
      const id = query?.id as string;

      if (!guardClients[id]) guardClients[id] = [];
        guardClients[id].push(ws);
        console.log(`✅ Guard ${id} connected`);

        ws.on("close", () => {
          if (guardClients[id]) {
            guardClients[id] = guardClients[id].filter((c) => c !== ws);
          }
          console.log(`❌ Guard ${id} disconnected`);
        });
    } else {
      console.log("❌ Unknown WS path:", pathname);
      ws.close();
    }
  });

  // Start streams for all mock cameras
  mockCameras.forEach((cam) => {
    if (cam.file) {
      startVideoStream(subscriptions, cam.id, cam.file);
    }
  });
};
