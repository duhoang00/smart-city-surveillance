import express from "express";
import cors from "cors";
import http from "http";

import router from "./routes"
import { initCCTV } from "./controllers/cctv";

const app = express();
const port = process.env.PORT || 8000;

app.use(
  cors({
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
  })
);

app.use("/api", router);

const server = http.createServer(app);

initCCTV(server);

server.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});