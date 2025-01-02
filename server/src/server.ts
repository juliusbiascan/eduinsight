import { Bonjour } from "bonjour-service";
import cors from "cors";
import express from "express";
import fs from "fs";
import https from "https";
import path from "path";
import { PeerServer } from "peer";
import { Server } from "socket.io";

const bonjourService = new Bonjour();

const advertisedPort = 4000;

const bonjourServiceName = "EduInsight Server";

const publish = bonjourService.publish({
  name: bonjourServiceName,
  type: "http",
  port: advertisedPort,
});

publish.on("up", () => {
  console.log("bonjour service up");
});

const app = express();

app.use(express.static(__dirname));

app.get("/", (req, res) => {
  console.log("req path...", req.path);
  res.sendFile(path.join(__dirname, "index.html"));
});

app.set("port", advertisedPort);
app.use(cors({ origin: "*" }));

app.use((_req, res, next) => {
  // Website you wish to allow to connect
  res.setHeader("Access-Control-Allow-Origin", "*");
  // Request methods you wish to allow
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, OPTIONS, PUT, PATCH, DELETE",
  );
  // Request headers you wish to allow
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-Requested-With,content-type",
  );
  // Set to true if you need the website to include cookies in the requests sent
  // to the API (e.g. in case you use sessions)
  res.setHeader("Access-Control-Allow-Credentials", "true");
  // Pass to next layer of middleware
  next();
});

const privateKey = fs.readFileSync(
  path.join(__dirname, "my_ssl_key.key"),
  "utf8",
);
const certificate = fs.readFileSync(
  path.join(__dirname, "my_ssl_cert.crt"),
  "utf8",
);

const credentials = { key: privateKey, cert: certificate };

const httpServer = https.createServer(credentials, app);

httpServer.listen(advertisedPort, "0.0.0.0");
httpServer.on("error", () => console.log("error"));
httpServer.on("listening", () => console.log("listening....."));

const peerServer = PeerServer({
  port: 9001,
  path: "/peerjs",
  ssl: { key: privateKey, cert: certificate },
});
peerServer.on("connection", (client) => {
  console.log("peer connection established: ", client.getId());
});

const io = new Server(httpServer, {
  path: "/socket.io",
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

let userCount = 0;

const fileChunks: Record<string, { chunks: string[]; totalChunks: number }> = {};

io.on("connection", (socket) => {
  console.log("a user connected");
  userCount++;
  io.emit("user count", userCount);

  const joinServer = (deviceId: string) => {
    socket.join(deviceId);
  };

  const leaveServer = (deviceId: string) => {
    socket.leave(deviceId);
  };

  const activityUpdate = ({ deviceId }: { deviceId: string }) => {
    socket.to(deviceId).emit("activity-update");
  };

  const shutdown = ({ deviceId }: { deviceId: string }) => {
    socket.to(deviceId).emit("shutdown", deviceId);
  };

  const logOff = ({ deviceId }: { deviceId: string }) => {
    socket.to(deviceId).emit("logoff", deviceId);
  };

  const reboot = ({ deviceId }: { deviceId: string }) => {
    socket.to(deviceId).emit("reboot", deviceId);
  };

  const powerMonitoringUpdate = ({ deviceId }: { deviceId: string }) => {
    socket.to(deviceId).emit("power-monitoring-update");
    socket.broadcast.emit("refresh-power-status");
  };

  const joinSubject = ({
    userId,
    subjectId,
  }: {
    userId: string;
    subjectId: string;
  }) => {
    socket.to(subjectId).emit("student-joined", { userId, subjectId });
  };

  const leaveSubject = ({
    userId,
    subjectId,
  }: {
    userId: string;
    subjectId: string;
  }) => {
    socket.to(subjectId).emit("student-left", { userId, subjectId });
  };

  const logoutUser = ({
    userId,
    subjectId,
  }: {
    userId: string;
    subjectId: string;
  }) => {
    socket.to(subjectId).emit("student-logged-out", { userId, subjectId });
  };

  const shareScreen = ({
    userId,
    subjectId,
    stream,
  }: {
    userId: string;
    subjectId: string;
    stream: MediaStream;
  }) => {
    socket.to(subjectId).emit("screen-share", { userId, stream });
  };

  const launchWebpage = ({
    deviceId,
    url,
  }: {
    deviceId: string;
    url: string;
  }) => {
    socket.to(deviceId).emit("launch-webpage", { url });
  };

  const uploadFileChunk = ({
    deviceId,
    chunk,
    filename,
    subjectName,
    chunkIndex,
    totalChunks,
  }: {
    deviceId: string;
    chunk: string;
    filename: string;
    subjectName: string;
    chunkIndex: number;
    totalChunks: number;
  }) => {
    if (!fileChunks[deviceId]) {
      fileChunks[deviceId] = { chunks: [], totalChunks };
    }
    fileChunks[deviceId].chunks[chunkIndex] = chunk;

    if (fileChunks[deviceId].chunks.filter(Boolean).length === totalChunks) {
      const fileContent = fileChunks[deviceId].chunks.join("");
      const buffer = Buffer.from(fileContent, "base64");
      socket
        .to(deviceId)
        .emit("upload-file-chunk", { file: buffer, filename, subjectName });
      delete fileChunks[deviceId];
    }
  };

  const showScreen = ({
    deviceId,
    userId,
    subjectId,
  }: {
    deviceId: string;
    userId: string;
    subjectId: string;
  }) => {
    socket.to(deviceId).emit("show-screen", { deviceId, userId, subjectId });
  };

  const hideScreen = ({ deviceId }: { deviceId: string }) => {
    socket.to(deviceId).emit("hide-screen");
  };

  const screenData = ({
    userId,
    subjectId,
    screenData,
  }: {
    userId: string;
    subjectId: string;
    screenData: string;
  }) => {
    socket.to(subjectId).emit("screen-data", { userId, subjectId, screenData });
  };

  const startLiveQuiz = ({
    deviceId,
    quizId,
  }: {
    deviceId: string;
    quizId: string;
  }) => {
    socket.to(deviceId).emit("start-live-quiz", { quizId });
  };

  socket.on("start-live-quiz", startLiveQuiz);
  socket.on("screen-data", screenData);
  socket.on("join-server", joinServer);
  socket.on("leave-server", leaveServer);
  socket.on("activity-update", activityUpdate);
  socket.on("shutdown", shutdown);
  socket.on("logoff", logOff);
  socket.on("reboot", reboot);
  socket.on("power-monitoring-update", powerMonitoringUpdate);
  socket.on("logout-user", logoutUser);
  socket.on("share-screen", shareScreen);
  socket.on("join-subject", joinSubject);
  socket.on("leave-subject", leaveSubject);
  socket.on("launch-webpage", launchWebpage);
  socket.on("upload-file-chunk", uploadFileChunk);
  socket.on("show-screen", showScreen);
  socket.on("hide-screen", hideScreen);
  socket.on("ping", () => {
    socket.emit("pong");
  });
  socket.on("disconnect", () => {
    console.log("user disconnected");
    userCount--;
    io.emit("user count", userCount);
  });
});
