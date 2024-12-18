import express from "express";
import https from "https";
import { Server } from "socket.io";
import cors from "cors";
import path from "path";
import fs from 'fs';

const app = express();

app.use(express.static(__dirname));

app.get('/', (req, res) => {
    console.log('req path...', req.path)
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.set('port', 4000);
app.use(cors({ origin: '*' }));

app.use((_req, res, next) => {
    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', '*');
    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    // Pass to next layer of middleware
    next();
});

const privateKey = fs.readFileSync(path.join(__dirname, 'my_ssl_key.key'), 'utf8');
const certificate = fs.readFileSync(path.join(__dirname, 'my_ssl_cert.crt'), 'utf8');

const credentials = { key: privateKey, cert: certificate };

const httpServer = https.createServer(credentials, app);
httpServer.listen(4000, '0.0.0.0');
httpServer.on('error', () => console.log('error'));
httpServer.on('listening', () => console.log('listening.....'));

const io = new Server(httpServer, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
    },
});

let userCount = 0;

io.on("connection", (socket) => {
    console.log("a user connected");
    userCount++;
    io.emit('user count', userCount);

    const joinServer = (deviceId: string) => {
        socket.join(deviceId);
    }

    const leaveServer = (deviceId: string) => {
        socket.leave(deviceId);
    }

    const mouseMove = ({ remoteId, move }: { remoteId: string, move: any }) => {
        socket.to(remoteId).emit('mouse_move', move);
    }

    const mouseClick = ({ remoteId, button }: IMouseClick) => {
        socket.to(remoteId).emit('mouse_click', button);
    }

    const mouseScroll = ({ remoteId, delta }: { remoteId: string, delta: any }) => {
        socket.to(remoteId).emit('mouse_scroll', delta);
    }

    const mouseDrag = ({ remoteId, move }: { remoteId: string, move: any }) => {
        socket.to(remoteId).emit('mouse_drag', move);
    }

    const keyboard = ({ remoteId, key }: { remoteId: string, key: string[] }) => {
        socket.to(remoteId).emit('keyboard', key);
    }

    const startSharing = (deviceId: string) => {
        socket.to(deviceId).emit('start_sharing');
    }

    const stopSharing = (deviceId: string) => {
        socket.to(deviceId).emit('stop_sharing');
    }

    const screenShare = ({ deviceId, screenData }: IScreenShare) => {
        socket.to(deviceId).emit('screen-share', { deviceId, screenData });
    }

    const loginUser = ({ deviceId, userId, labId }: ILoginUser) => {
        console.log("login-user");
        socket.to(deviceId).emit('login-user', deviceId, userId, labId);
        socket.broadcast.emit('refresh');
    }

    const logoutUser = ({ deviceId, userId }: ILogoutUser) => {
        console.log("logout-user");
        socket.to(deviceId).emit('logout-user', deviceId, userId);
        socket.broadcast.emit('refresh');
    }

    const activityUpdate = ({ deviceId }: { deviceId: string }) => {
        socket.to(deviceId).emit('activity-update');
    }

    socket.on("join-server", joinServer)
    socket.on("leave-server", leaveServer)
    socket.on("mouse-move", mouseMove)
    socket.on("mouse-click", mouseClick)
    socket.on("mouse-scroll", mouseScroll)
    socket.on("mouse-drag", mouseDrag)
    socket.on("keyboard-event", keyboard)
    socket.on("start-sharing", startSharing)
    socket.on("stop-sharing", stopSharing)
    socket.on("screen-share", screenShare)
    socket.on("login-user", loginUser)
    socket.on("logout-user", logoutUser)
    socket.on("activity-update", activityUpdate)
    socket.on('ping', () => {
        socket.emit('pong');
    });
    socket.on("disconnect", () => {
        console.log("user disconnected");
        userCount--;
        io.emit('user count', userCount);
    });
});

interface IMouseClick {
    remoteId: string,
    button: {
        button: string,
        double: boolean
    }
}

interface IScreenShare {
    deviceId: string,
    screenData: string
}

interface ILoginUser {
    deviceId: string,
    userId: string,
    labId: string
}

interface ILogoutUser {
    deviceId: string,
    userId: string
}
