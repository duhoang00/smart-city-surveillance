import {
	ActivityMessage,
} from "@repo/types";
import { WebSocket } from "ws";

export const send = (ws: WebSocket, payload: ActivityMessage) => {
	if (ws.readyState === WebSocket.OPEN) {
		ws.send(JSON.stringify(payload));
	}
};

export const broadcast = (clients: WebSocket[], payload: ActivityMessage) => {
	clients.forEach((client) => send(client, payload));
};