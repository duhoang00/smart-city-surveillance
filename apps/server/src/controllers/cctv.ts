import { WebSocket } from "ws";
import ffmpeg from "fluent-ffmpeg";
import { PassThrough } from "stream";

export const startVideoStream = (subscriptions:Map<WebSocket, string[]>, camId: string, file: string) => {
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
