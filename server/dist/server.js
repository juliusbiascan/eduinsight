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
app.use((0, cors_1.default)({
    origin: true,
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
}));
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
const privateKey = fs_1.default.readFileSync(path_1.default.join(__dirname, "ssl/eduinsight_systems.key"), "utf8");
const certificate = fs_1.default.readFileSync(path_1.default.join(__dirname, "ssl/eduinsight_systems.crt"), "utf8");
const credentials = {
    key: privateKey,
    cert: certificate,
    requestCert: false,
    rejectUnauthorized: false,
};
const httpServer = https_1.default.createServer(credentials, app);
httpServer.listen(advertisedPort, "0.0.0.0");
httpServer.on("error", () => console.log("error"));
httpServer.on("listening", () => console.log("listening....."));
const io = new socket_io_1.Server(httpServer, {
    path: "/socket.io",
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
    },
    maxHttpBufferSize: 1e8, // 100MB
    pingTimeout: 120000, // Increase to 120 seconds
    pingInterval: 25000, // Keep at 25 seconds
    transports: ["websocket", "polling"], // Explicitly define transports
    connectTimeout: 60000, // 60 second connection timeout
});
// Add max listeners configuration
process.setMaxListeners(15); // Increase default limit to accommodate our needs
let userCount = 0;
const CHUNK_TIMEOUT = 5 * 60 * 1000; // 5 minutes
const fileTransfers = new Map();
const TRANSFER_TIMEOUT = 30 * 60 * 1000; // 30 minutes
// Move cleanup handler outside connection scope
process.on("exit", () => {
    // Cleanup all file transfers
    Array.from(fileTransfers.entries()).forEach(([_, transfer]) => {
        if (transfer.timeoutHandle) {
            clearTimeout(transfer.timeoutHandle);
        }
    });
    fileTransfers.clear();
});
const screenMetrics = new Map();
const updateMetrics = (userId, metrics) => {
    const current = screenMetrics.get(userId) || {
        fps: 0,
        quality: 0.8,
        networkDelay: 0,
        droppedFrames: 0,
        lastUpdate: Date.now(),
        totalFrames: 0,
    };
    screenMetrics.set(userId, Object.assign(Object.assign(Object.assign({}, current), metrics), { lastUpdate: Date.now() }));
};
const screenSharing = new Map();
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
        try {
            // Validate inputs
            if (!(targets === null || targets === void 0 ? void 0 : targets.length) || !filename || !subjectName) {
                throw new Error("Missing required parameters");
            }
            // Generate consistent file ID
            const fileId = `${filename}-${fileSize}-${totalChunks}`;
            let transfer = fileTransfers.get(fileId);
            if (!transfer) {
                transfer = {
                    chunks: new Array(totalChunks),
                    buffer: new Array(totalChunks),
                    totalChunks,
                    receivedChunks: 0,
                    targets,
                    subjectName,
                    filename,
                    fileType,
                    fileSize,
                    lastUpdate: Date.now(),
                    startTime: Date.now(),
                    chunkSize: Math.ceil(fileSize / totalChunks),
                    timeoutHandle: setTimeout(() => {
                        fileTransfers.delete(fileId);
                        targets.forEach((deviceId) => {
                            socket.to(deviceId).emit("file-error", {
                                fileId,
                                error: "Transfer timeout",
                                filename,
                            });
                        });
                    }, TRANSFER_TIMEOUT),
                };
                fileTransfers.set(fileId, transfer);
            }
            // Process chunk
            if (!transfer.chunks[chunkIndex]) {
                const chunkBuffer = Buffer.from(chunk, "base64");
                transfer.chunks[chunkIndex] = chunk;
                transfer.buffer[chunkIndex] = chunkBuffer;
                transfer.receivedChunks++;
                transfer.lastUpdate = Date.now();
                // Calculate progress and speed
                const progress = (transfer.receivedChunks / totalChunks) * 100;
                const elapsedTime = (Date.now() - transfer.startTime) / 1000;
                const bytesReceived = transfer.receivedChunks * transfer.chunkSize;
                const speed = bytesReceived / elapsedTime; // bytes per second
                // Send detailed progress
                targets.forEach((deviceId) => {
                    socket.to(deviceId).emit("file-progress", {
                        fileId,
                        filename,
                        progress: Math.round(progress),
                        speed,
                        remaining: totalChunks - transfer.receivedChunks,
                    });
                });
                // Check if transfer is complete
                if (transfer.receivedChunks === totalChunks) {
                    try {
                        // Clear timeout
                        if (transfer.timeoutHandle) {
                            clearTimeout(transfer.timeoutHandle);
                        }
                        const completeBuffer = Buffer.concat(transfer.buffer);
                        targets.forEach((deviceId) => {
                            socket.to(deviceId).emit("upload-file-chunk", {
                                fileId,
                                file: completeBuffer,
                                filename,
                                subjectName: transfer.subjectName,
                                fileType: transfer.fileType,
                            });
                        });
                        socket.emit("file-complete", {
                            fileId,
                            filename,
                            targetCount: targets.length,
                            totalSize: completeBuffer.length,
                        });
                    }
                    catch (error) {
                        throw new Error(`Failed to process complete file: ${isError(error) ? error.message : "Unknown error"}`);
                    }
                    finally {
                        // Cleanup
                        transfer.buffer = [];
                        transfer.chunks = [];
                        fileTransfers.delete(fileId);
                    }
                }
            }
        }
        catch (error) {
            console.error("Error in uploadFileChunk:", error);
            socket.emit("file-error", {
                fileId: `${filename}-${Date.now()}`,
                error: isError(error) ? error.message : "Internal server error during file transfer",
                filename,
            });
        }
    };
    // Add cleanup interval for stale transfers
    const cleanupInterval = setInterval(() => {
        try {
            const now = Date.now();
            Array.from(fileTransfers.entries()).forEach(([fileId, transfer]) => {
                if (now - transfer.lastUpdate > CHUNK_TIMEOUT) {
                    fileTransfers.delete(fileId);
                    console.log(`Cleaned up stale transfer: ${fileId}`);
                }
            });
        }
        catch (error) {
            console.error("Error in cleanup interval:", isError(error) ? error.message : "Unknown error");
        }
    }, 60 * 1000);
    // Clean up interval on socket disconnect instead of process exit
    socket.on("disconnect", () => {
        clearInterval(cleanupInterval);
    });
    // Add error type guard helper
    const isError = (error) => {
        return error instanceof Error;
    };
    const performanceMetrics = {
        screenUpdates: new Map(),
        resetMetrics(userId) {
            this.screenUpdates.set(userId, {
                count: 0,
                totalSize: 0,
                lastUpdate: Date.now(),
                droppedFrames: 0,
                avgFPS: 0,
                networkDelay: 0, // Initialize networkDelay
            });
        },
    };
    const screenRateLimiter = new Map();
    const screenData = ({ userId, subjectId, data, timestamp, metadata, }) => {
        try {
            // Update performance metrics
            updateMetrics(userId, Object.assign(Object.assign({}, metadata), { networkDelay: Date.now() - timestamp }));
            // Get current metrics
            const currentMetrics = screenMetrics.get(userId);
            // Emit with metrics
            socket.to(subjectId).volatile.emit("screen-data", {
                userId,
                screenData: data,
                timestamp,
                metrics: currentMetrics,
            });
            // Adaptive quality control
            if (currentMetrics && currentMetrics.networkDelay > 200) {
                socket.emit("adjust-quality", {
                    targetFPS: Math.max(15, currentMetrics.fps - 5),
                    quality: Math.max(0.5, currentMetrics.quality - 0.1),
                });
            }
        }
        catch (error) {
            console.error("Screen data error:", error);
        }
    };
    // Add cleanup for rate limiters and metrics
    socket.on("disconnect", (reason) => {
        // Clean up screen sharing related resources
        screenRateLimiter.delete(socket.id);
        performanceMetrics.screenUpdates.delete(socket.id);
        // Clean up intervals
        clearInterval(cleanupInterval);
        // Update user count
        console.log("user disconnected, reason:", reason);
        userCount--;
        io.emit("user count", userCount);
        // Log disconnect
        console.log(`Client ${socket.id} disconnected`);
    });
    // Update showScreen handler to initialize metrics
    const showScreen = ({ deviceId, userId, subjectId, }) => {
        try {
            const settings = {
                targetFPS: 20,
                quality: 0.8,
                resolution: { width: 854, height: 480 },
                adaptiveThresholds: {
                    latencyHigh: 200,
                    latencyLow: 50,
                    dropRateHigh: 0.1,
                    dropRateLow: 0.05,
                },
            };
            screenSharing.set(userId, {
                startTime: Date.now(),
                frames: 0,
                quality: settings.quality,
                lastUpdate: Date.now(),
                settings,
            });
            socket.to(deviceId).emit("show-screen", {
                userId,
                subjectId,
                settings,
            });
            // Monitor performance and adjust settings
            const monitor = setInterval(() => {
                const sharing = screenSharing.get(userId);
                if (!sharing) {
                    return;
                }
                const metrics = screenMetrics.get(userId);
                if (!metrics) {
                    return;
                }
                const newQuality = adjustQuality(metrics, sharing.settings);
                if (newQuality !== sharing.quality) {
                    sharing.quality = newQuality;
                    socket.emit("adjust-quality", { quality: newQuality });
                }
            }, 5000);
            cleanupFunctions.set(userId, () => {
                clearInterval(monitor);
                screenSharing.delete(userId);
                screenMetrics.delete(userId);
            });
        }
        catch (error) {
            console.error("Error in showScreen:", error);
            socket.emit("screen-share-error", {
                userId,
                error: error instanceof Error ? error.message : "Unknown error",
            });
        }
    };
    const hideScreen = ({ deviceId, userId }) => {
        const cleanup = cleanupFunctions.get(userId);
        if (cleanup) {
            cleanup();
            cleanupFunctions.delete(userId);
        }
        socket.to(deviceId).emit("hide-screen", {
            userId,
            timestamp: Date.now(),
        });
    };
    const adjustQuality = (metrics, settings) => {
        const { latencyHigh, latencyLow, dropRateHigh, dropRateLow } = settings.adaptiveThresholds;
        if (metrics.networkDelay > latencyHigh || metrics.droppedFrames / metrics.totalFrames > dropRateHigh) {
            return Math.max(0.5, metrics.quality - 0.1);
        }
        else if (metrics.networkDelay < latencyLow && metrics.droppedFrames / metrics.totalFrames < dropRateLow) {
            return Math.min(0.9, metrics.quality + 0.05);
        }
        return metrics.quality;
    };
    // Add at the top with other interface definitions
    const cleanupFunctions = new Map();
    const startLiveQuiz = ({ deviceId, quizId, }) => {
        socket.to(deviceId).emit("start-live-quiz", { quizId });
    };
    const handleScreenShareOffer = ({ senderId, receiverId, signalData, }) => {
        socket.to(receiverId).emit("screen-share-offer", { senderId, signalData });
    };
    const handleScreenShareStopped = ({ senderId, receiverId, }) => {
        socket.to(receiverId).emit("screen-share-stopped", { senderId });
    };
    const limitWeb = ({ enabled }) => {
        // Broadcast to all connected clients
        io.emit("limit-web", { enabled });
    };
    const getWebLimitStatus = () => {
        // Broadcast request to all connected clients
        io.emit("get-web-limit-status");
    };
    const webLimited = ({ success, enabled, error }) => {
        // Broadcast response to all except sender
        socket.broadcast.emit("web-limited", { success, enabled, error });
    };
    const webLimitStatus = ({ success, limited, error }) => {
        // Broadcast status to all except sender
        socket.broadcast.emit("web-limit-status", { success, limited, error });
    };
    socket.on("ping", () => {
        socket.emit("pong");
    });
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
    socket.on("leave-server", leaveServer);
    socket.on("limit-web", limitWeb);
    socket.on("get-web-limit-status", getWebLimitStatus);
    socket.on("web-limited", webLimited);
    socket.on("web-limit-status", webLimitStatus);
    // Single consolidated disconnect handler
    socket.once("disconnect", (reason) => {
        try {
            console.log(`Client ${socket.id} disconnected, reason:`, reason);
            // Clean up screen sharing resources
            screenRateLimiter.delete(socket.id);
            performanceMetrics.screenUpdates.delete(socket.id);
            screenMetrics.delete(socket.id);
            // Clear all cleanup functions for this socket
            Array.from(cleanupFunctions.entries()).forEach(([userId, cleanup]) => {
                if (socket.rooms.has(userId)) {
                    cleanup();
                    cleanupFunctions.delete(userId);
                }
            });
            // Clean up intervals
            clearInterval(cleanupInterval);
            // Update user count
            userCount = Math.max(0, userCount - 1); // Prevent negative count
            io.emit("user count", userCount);
        }
        catch (error) {
            console.error("Error during disconnect cleanup:", error);
        }
    });
    // Error handler
    socket.on("error", (error) => {
        console.error("Socket error:", error);
        // Attempt cleanup on error
        screenRateLimiter.delete(socket.id);
        performanceMetrics.screenUpdates.delete(socket.id);
        screenMetrics.delete(socket.id);
    });
    // Remove all other disconnect handlers
});
