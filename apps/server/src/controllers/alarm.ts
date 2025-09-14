import { Request, Response } from "express";
import { WebSocket } from "ws";

import { mockGuards } from "../mocks";
import { guardClients } from "./socket";

export const sendAlarm = async (req: Request, res: Response) => {
  try {
    const { cameraId, message } = req.body;

    if (!cameraId || !message) {
      return res.status(400).json({ error: "cameraId and message are required" });
    }

    const guard = mockGuards.find((g) => g.camera === cameraId);
    if (!guard) {
      return res.status(404).json({ error: `No guard assigned to ${cameraId}` });
    }

    const payload = {
      type: "alarm",
      cameraId,
      guardId: guard.id,
      message,
      timestamp: new Date().toISOString(),
    };

    (guardClients[guard.id] || []).forEach((ws) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(payload));
      }
    });

    res.status(200).json({ success: true, payload });
  } catch (err) {
    console.error("Error sending alarm:", err);
    res.status(500).json({ error: "internal error" });
  }
};
