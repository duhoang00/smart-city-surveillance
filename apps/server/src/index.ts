import express from "express";
import cors from "cors";
import http from "http";

import router from "./routes"
import { initSockets } from "./controllers/socket";

const app = express();
const port = process.env.PORT || 8000;

app.use(
  cors({
    origin: process.env.WEB_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
  })
);

app.use("/api", router);

const server = http.createServer(app);

initSockets(server);

server.listen(port, () => {
  console.log(`Server is running at PORT: ${port}`);
});