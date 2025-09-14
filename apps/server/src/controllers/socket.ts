import { Server } from "http";
import { parse } from "url";
import { WebSocketServer, WebSocket } from "ws";

import {
  AlarmMessage,
  UpdateMessage,
} from "@repo/types";

import { mockCameras, mockGuards } from "../mocks";
import { startVideoStream } from "./cctv";
import { send, broadcast } from "../utils"

export const cctvClient = new Map<WebSocket, string[]>();
export const guardClients: Record<string, WebSocket[]> = {};
let operatorClient: WebSocket | null = null;

export const initSockets = (server: Server) => {
  const wss = new WebSocketServer({ noServer: true });

  server.on("upgrade", (req, socket, head) => {
    wss.handleUpgrade(req, socket, head, (ws) => {
      wss.emit("connection", ws, req);
    });
  });

  wss.on("connection", (ws, req) => {
    const { pathname, query } = parse(req.url || "", true);

    // ========== CCTV ==========
    if (pathname === "/cctv") {
      ws.on("message", (msg) => {
        try {
          const data = JSON.parse(msg.toString());
          if (data.action === "subscribe" && Array.isArray(data.cameraIds)) {
            cctvClient.set(ws, data.cameraIds);
          }
        } catch (err) {
          console.error("❌ Invalid CCTV message", err);
        }
      });
      ws.on("close", () => cctvClient.delete(ws));

      // ========== Guard ==========
    } else if (pathname === "/alarm") {
      const guardId = query?.id as string;
      if (!guardId) {
        ws.close();
        return;
      }

      if (!guardClients[guardId]) guardClients[guardId] = [];
      guardClients[guardId].push(ws);

      ws.on("message", (msg) => {
        try {
          const data = JSON.parse(msg.toString());
          if (data.type === "update") {
            const payload: UpdateMessage = {
              type: "update",
              guardId,
              message: data.message ?? "",
              timestamp: new Date().toISOString(),
            };

            if (operatorClient) send(operatorClient, payload);
            broadcast(guardClients[guardId] || [], payload);
          }
        } catch (err) {
          console.error("❌ Invalid guard message", err);
        }
      });

      ws.on("close", () => {
        guardClients[guardId] = (guardClients[guardId] || []).filter((c) => c !== ws);
      });

      // ========== Operator ==========
    } else if (pathname === "/operator") {
      operatorClient = ws;

      ws.on("message", (msg) => {
        try {
          const data = JSON.parse(msg.toString());
          if (data.type === "alarm" && data.cameraId) {
            const guard = mockGuards.find((g) => g.camera === data.cameraId);
            if (!guard) return;

            const payload: AlarmMessage = {
              type: "alarm",
              guardId: guard.id,
              cameraId: data.cameraId,
              message: data.message ?? "",
              timestamp: new Date().toISOString(),
            };

            broadcast(guardClients[guard.id] || [], payload);
            if (operatorClient) send(operatorClient, payload);
          }
        } catch (err) {
          console.error("❌ Invalid operator message", err);
        }
      });

      ws.on("close", () => {
        operatorClient = null;
      });

    } else {
      console.log("❌ Unknown WS path:", pathname);
      ws.close();
    }
  });

  // Start streams for all mock cameras
  mockCameras.forEach((cam) => {
    if (cam.file) {
      startVideoStream(cctvClient, cam.id, cam.file);
    }
  });
};
