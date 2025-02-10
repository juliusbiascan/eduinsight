import { PeerServer } from "peer";

const peerServer = PeerServer({
  path: "/eduinsight",
  port: 9001,
  host: "0.0.0.0",
  proxied: true,
  allow_discovery: true,
});

peerServer.on("connection", (client) => {
  console.log(`Client connected: ${client.getId()}`);
});

peerServer.on("error", (error) => {
  console.error("PeerServer error:", error);
});
