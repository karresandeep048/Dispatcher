const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const orderRoutes = require("./routes/orderRoutes");

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();
const server = http.createServer(app);

const allowedOrigins = [
  process.env.CLIENT_URL,
  "http://localhost:3000",
  "http://localhost:5000",
  "http://localhost:5005",
].filter(Boolean);

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin) || origin.startsWith("http://localhost:")) {
      callback(null, true);
    } else {
      callback(null, true);
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE"],
};

// Socket.IO configuration
const io = new Server(server, {
  cors: corsOptions,
});

// Make io accessible throughout the app
app.set("io", io);

// Middleware
app.use(cors(corsOptions));

app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/orders", orderRoutes);

// Health check route
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Hyper-Local Delivery Dispatcher API is running...",
  });
});

// Socket.IO events
io.on("connection", (socket) => {
  console.log(`New socket connection: ${socket.id}`);

  // Rider sends live location updates
  socket.on("riderLocationUpdate", (data) => {
    // data = { riderId, name, vehicleNumber, lat, lng }
    io.emit("riderLocationBroadcast", data);
  });

  socket.on("disconnect", () => {
    console.log(`Socket disconnected: ${socket.id}`);
  });
});

// Start server
const PORT = process.env.PORT || 5005;

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});