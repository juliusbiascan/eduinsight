"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bonjour_service_1 = require("bonjour-service");
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const fs_1 = __importDefault(require("fs"));
const https_1 = __importDefault(require("https"));
const path_1 = __importDefault(require("path"));
const peer_1 = require("peer");
const socket_io_1 = require("socket.io");
const bonjourService = new bonjour_service_1.Bonjour();
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
const app = (0, express_1.default)();
app.use(express_1.default.static(__dirname));
app.get("/", (req, res) => {
    console.log("req path...", req.path);
    res.sendFile(path_1.default.join(__dirname, "index.html"));
});
app.set("port", advertisedPort);
app.use((0, cors_1.default)({ origin: "*" }));
app.use((_req, res, next) => {
    // Website you wish to allow to connect
    res.setHeader("Access-Control-Allow-Origin", "*");
    // Request methods you wish to allow
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, PATCH, DELETE");
    // Request headers you wish to allow
    res.setHeader("Access-Control-Allow-Headers", "X-Requested-With,content-type");
    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader("Access-Control-Allow-Credentials", "true");
    // Pass to next layer of middleware
    next();
});
const privateKey = fs_1.default.readFileSync(path_1.default.join(__dirname, "my_ssl_key.key"), "utf8");
const certificate = fs_1.default.readFileSync(path_1.default.join(__dirname, "my_ssl_cert.crt"), "utf8");
const credentials = { key: privateKey, cert: certificate };
const httpServer = https_1.default.createServer(credentials, app);
httpServer.listen(advertisedPort, "0.0.0.0");
httpServer.on("error", () => console.log("error"));
httpServer.on("listening", () => console.log("listening....."));
const peerServer = (0, peer_1.PeerServer)({
    port: 9001,
    path: "/peerjs",
    ssl: { key: privateKey, cert: certificate },
});
peerServer.on("connection", (client) => {
    console.log("peer connection established: ", client.getId());
});
const io = new socket_io_1.Server(httpServer, {
    path: "/socket.io",
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
    },
});
let userCount = 0;
const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB limit
const ALLOWED_FILE_TYPES = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.ms-powerpoint",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    "text/plain",
    "image/jpeg",
    "image/png",
    "image/gif",
];
const fileChunks = {};
io.on("connection", (socket) => {
    console.log("a user connected");
    userCount++;
    io.emit("user count", userCount);
    const joinServer = (deviceId) => {
        socket.join(deviceId);
    };
    const leaveServer = (deviceId) => {
        socket.leave(deviceId);
    };
    const activityUpdate = ({ deviceId }) => {
        socket.to(deviceId).emit("activity-update");
    };
    const shutdown = ({ deviceId }) => {
        socket.to(deviceId).emit("shutdown", deviceId);
    };
    const logOff = ({ deviceId }) => {
        socket.to(deviceId).emit("logoff", deviceId);
    };
    const reboot = ({ deviceId }) => {
        socket.to(deviceId).emit("reboot", deviceId);
    };
    const powerMonitoringUpdate = ({ deviceId }) => {
        socket.to(deviceId).emit("power-monitoring-update");
        socket.broadcast.emit("refresh-power-status");
    };
    const joinSubject = ({ userId, subjectId, }) => {
        socket.to(subjectId).emit("student-joined", { userId, subjectId });
    };
    const leaveSubject = ({ userId, subjectId, }) => {
        socket.to(subjectId).emit("student-left", { userId, subjectId });
    };
    const logoutUser = ({ userId, subjectId, }) => {
        socket.to(subjectId).emit("student-logged-out", { userId, subjectId });
    };
    const shareScreen = ({ userId, subjectId, stream, }) => {
        socket.to(subjectId).emit("screen-share", { userId, stream });
    };
    const launchWebpage = ({ deviceId, url, }) => {
        socket.to(deviceId).emit("launch-webpage", { url });
    };
    const uploadFileChunk = ({ targets, chunk, filename, subjectName, chunkIndex, totalChunks, fileType, fileSize, }) => {
        // Validate file type and size
        if (!ALLOWED_FILE_TYPES.includes(fileType)) {
            socket.emit("file-error", {
                error: "File type not allowed",
                filename,
            });
            return;
        }
        if (fileSize > MAX_FILE_SIZE) {
            socket.emit("file-error", {
                error: "File size exceeds limit",
                filename,
            });
            return;
        }
        const fileId = `${filename}-${Date.now()}`; // Unique ID for this file transfer
        if (!fileChunks[fileId]) {
            fileChunks[fileId] = {
                chunks: new Array(totalChunks),
                totalChunks,
                targets,
                subjectName,
                filename,
                fileType,
                fileSize,
                receivedSize: 0,
            };
        }
        fileChunks[fileId].chunks[chunkIndex] = chunk;
        fileChunks[fileId].receivedSize += chunk.length;
        // Send progress update
        const progress = (fileChunks[fileId].receivedSize / fileSize) * 100;
        targets.forEach((deviceId) => {
            socket.to(deviceId).emit("file-progress", {
                fileId,
                filename,
                progress: Math.round(progress),
            });
        });
        // Check if all chunks are received
        const allChunksReceived = fileChunks[fileId].chunks.every((chunk) => chunk !== undefined);
        if (allChunksReceived) {
            try {
                const fileContent = fileChunks[fileId].chunks.join("");
                const buffer = Buffer.from(fileContent, "base64");
                // Send to each target device
                targets.forEach((deviceId) => {
                    socket.to(deviceId).emit("upload-file-chunk", {
                        fileId,
                        file: buffer,
                        filename,
                        subjectName: fileChunks[fileId].subjectName,
                        fileType: fileChunks[fileId].fileType,
                    });
                });
                // Notify successful transfer
                socket.emit("file-complete", {
                    filename,
                    targetCount: targets.length,
                });
            }
            catch (error) {
                socket.emit("file-error", {
                    error: "Failed to process file",
                    filename,
                });
            }
            finally {
                // Cleanup
                delete fileChunks[fileId];
            }
        }
    };
    const showScreen = ({ deviceId, userId, subjectId, }) => {
        socket.to(deviceId).emit("show-screen", { deviceId, userId, subjectId });
    };
    const hideScreen = ({ deviceId }) => {
        socket.to(deviceId).emit("hide-screen");
    };
    const screenData = ({ userId, subjectId, screenData, }) => {
        socket.to(subjectId).emit("screen-data", { userId, subjectId, screenData });
    };
    const startLiveQuiz = ({ deviceId, quizId, }) => {
        socket.to(deviceId).emit("start-live-quiz", { quizId });
    };
    const handleScreenShareOffer = ({ senderId, receiverId, signalData, }) => {
        socket.to(receiverId).emit("screen-share-offer", { senderId, signalData });
    };
    // Add this new handler
    const handleScreenShareStopped = ({ senderId, receiverId, }) => {
        socket.to(receiverId).emit("screen-share-stopped", { senderId });
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
    socket.on("screen-share-offer", handleScreenShareOffer);
    socket.on("screen-share-stopped", handleScreenShareStopped);
    socket.on("ping", () => {
        socket.emit("pong");
    });
    socket.on("disconnect", () => {
        console.log("user disconnected");
        userCount--;
        io.emit("user count", userCount);
    });
});
