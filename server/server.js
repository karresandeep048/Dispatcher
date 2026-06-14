const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const orderRoutes = require("./routes/orderRoutes");

dotenv.config();
connectDB();

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE"],
  },
});

app.set("io", io);

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/orders", orderRoutes);

app.get("/", (req, res) => {
  res.send("Hyper-Local Delivery Dispatcher API is running...");
});

io.on("connection", (socket) => {
  console.log("New socket connection:", socket.id);

  // Rider sends live location updates
  socket.on("riderLocationUpdate", (data) => {
    // data = { riderId, name, vehicleNumber, lat, lng }
    io.emit("riderLocationBroadcast", data);
  });

  socket.on("disconnect", () => {
    console.log("Socket disconnected:", socket.id);
  });
});

const PORT = process.env.PORT || 5005;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
