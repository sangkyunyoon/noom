import http from "http";
import WebSocket from "ws";
import express from "express";
import { Http2ServerResponse } from "http2";

const app = express();

app.set("view engine", "pug");
app.set("views", __dirname + "/views");
app.use("/public", express.static(__dirname + "/public"));

app.get("/", (req, res) => res.render("home"));
app.get("/*", (req, res) => res.redirect("/"));

const handleListen = () => console.log('Listening on http://localhost:3000');

const server = http.createServer(app);

const wss = new WebSocket.Server({ server });

function onSocketClose(socket) {
    console.log("Disconnected from the Browser ❌");
}

function onSocketMessage(message) {
    const li = document.createElement("li");
    li.innerText = message.toString();
    messageList.append(li);
}

const sockets = [];

wss.on("connection", (socket) => {
    sockets.push(socket);
    socket["nickname"] = "Anon";
    console.log("Connected to Browser ✅");
    socket.on("close", onSocketClose);
    socket.on("message", (msg) => {
        const message = JSON.parse(msg);
        switch(message.type) {
            case "new_message":
                sockets.forEach((aSocket) => {
                    aSocket.send(`${socket.nickname}: ${message.payload}`);
                });
                break;
            case "nickname":
                console.log(message.payload);
                socket["nickname"] = message.payload;
                break;
            default:
                break;
        }
    });
});

server.listen(3000, handleListen);
