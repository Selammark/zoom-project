const express = require("express");
const app = express();
const server = require("http").Server(app);
const io = require("socket.io")(server);
const { v4: uuidv4 } = require("uuid");
const { ExpressPeerServer } = require("peer");
const peerServer = ExpressPeerServer(server, {
  debug: true,
});
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use("/peerjs", peerServer);
app.get("/", (req, res) => {
  res.redirect(`/${uuidv4()}`);
});
app.get("/:index", (req, res) => {
  res.render("index", { roomid: req.params.room });
});
io.on("connection", (socket) => {
  socket.on("join-room", (roomid, userid) => {
    socket.join(roomid);
    // socket.to(roomid).broadcast.emit('user-connected');
    socket.broadcast.to(roomid).emit("user-connected", userid);
    socket.on("message", (message) => {
      io.to(roomid).emit("createMessage", message);
    });
    socket.on("disconnect", () => {
      socket.broadcast.to(roomid).emit("user-disconnected", userid);
    });
  });
});
server.listen(process.env.PORT || 3000);
