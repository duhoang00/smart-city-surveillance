import express from "express";
import { WebSocketServer, WebSocket } from "ws";
import path from "path";
import fs from "fs";
import cors from "cors";
import ffmpeg from "fluent-ffmpeg";
import { PassThrough } from "stream";

const app = express();
const port = process.env.PORT || 8000;

app.use(
  cors({
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
  })
);

// --- Dummy camera list ---
const cameras = [
  { id: "cam1", name: "Mock Camera 1" },
  { id: "cam2", name: "Mock Camera 2" },
  { id: "cam3", name: "Mock Camera 3" },
  { id: "cam4", name: "Mock Camera 4" },
  { id: "cam5", name: "Mock Camera 5" },
  { id: "cam6", name: "Mock Camera 6" },
  { id: "cam7", name: "Mock Camera 7" },
];

// --- REST API ---
app.get("/", (req, res) => {
  res.send("Hello from Smart City Surveillance Backend");
});

app.get("/api/cameras", (req, res) => {
  res.json(cameras);
});

const server = app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});

// --- WebSocket Setup ---
const wss = new WebSocketServer({ server, path: "/cctv" });
const subscriptions = new Map<WebSocket, string[]>();

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

// --- Helper: stream video frames for each camera ---
function startVideoStream(camId: string, file: string) {
  const loop = () => {
    const stream = new PassThrough();

    ffmpeg(file)
      .inputOptions(["-re"]) // simulate real-time
      .outputOptions([
        "-vf", "fps=2,scale=640:-1", // 2 frames/sec, resize smaller
        "-update", "1",
        "-q:v", "5", // quality
      ])
      .format("image2pipe")
      .output(stream)
      .on("end", () => {
        setTimeout(loop, 100); // loop video
      })
      .on("error", (err) => {
        console.error(`${camId} stream error:`, err.message);
        setTimeout(loop, 2000);
      })
      .run();

    let buffer: Buffer[] = [];
    stream.on("data", (chunk) => {
      buffer.push(chunk);
      if (chunk.toString("hex", 0, 2) === "ffd8") {
        // new JPEG frame starts
        const frame = Buffer.concat(buffer);
        buffer = [];

        const base64 = frame.toString("base64");

        // send to all subscribed clients
        for (const [ws, subscribedCams] of subscriptions.entries()) {
          if (ws.readyState !== WebSocket.OPEN) continue;
          if (subscribedCams.includes(camId)) {
            ws.send(
              JSON.stringify({
                cameraId: camId,
                frame: base64,
              })
            );
          }
        }
      }
    });
  };

  loop();
}

// --- Start all mock camera feeds ---
startVideoStream("cam1", path.join(__dirname, "cam1.mp4"));
startVideoStream("cam2", path.join(__dirname, "cam2.mp4"));
startVideoStream("cam3", path.join(__dirname, "cam3.mp4"));
startVideoStream("cam4", path.join(__dirname, "cam4.mp4"));
startVideoStream("cam5", path.join(__dirname, "cam5.mp4"));
startVideoStream("cam6", path.join(__dirname, "cam6.mp4"));
startVideoStream("cam7", path.join(__dirname, "cam7.mp4"));
