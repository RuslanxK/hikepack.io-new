const express = require('express');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const cors = require('cors');
const userRouter = require("./routers/userRouter")
const tripRouter = require("./routers/tripRouter")
const bagRouter = require("./routers/bagRouter")
const categoryRouter = require("./routers/categoryRouter")
const itemRouter = require("./routers/itemRouter")
const articleRouter = require('./routers/articleRouter')
const changeLogRouter = require("./routers/changelogRouter")
const reportRouter = require("./routers/reportRouter")
// const checkoutRouter = require("./routers/checkoutRouter")
const { Server } = require('socket.io');
const http = require('http');
const User = require("./models/user")
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const aiRoutes = require("./BL/openAI")
const axios = require("axios")
dotenv.config();


const PRINTIFY_API_TOKEN = process.env.PRINTIFY_API_TOKEN

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    return callback(null, true);
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));
app.use(cookieParser());
app.use(express.json());

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch((err) => console.error('MongoDB Connection Error:', err));
  
app.use("/api", aiRoutes);
app.use('/api/user', userRouter);
app.use('/api/trips', tripRouter);
app.use('/api/bags', bagRouter)
app.use('/api/categories', categoryRouter)
app.use('/api/items', itemRouter)
app.use('/api/articles', articleRouter)
app.use('/api/changelogs', changeLogRouter)
app.use('/api/report', reportRouter);
// app.use("/api/checkout", checkoutRouter);


app.get('/', (req, res) => {
  res.send('Server is running!');
});


// app.get('/api/products', async (req, res) => {
//   try {
//     const response = await axios.get(
//       'https://api.printify.com/v1/shops/22520921/products.json',
//       {
//         headers: {
//           Authorization: `Bearer ${PRINTIFY_API_TOKEN}`,
//         },
//       }
//     );

//     res.json(response.data);
    
//   } catch (error) {
//     res.status(500).json({ message: 'Error fetching products', error });
//   }
// });


const httpServer = http.createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.EMAIL_URL,
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

const connectedUsers = new Set();

io.use(async (socket, next) => {
  const token = socket.handshake.auth.token;

  if (!token) {
    console.log("Token not provided in handshake auth");
    return next(new Error("No token provided"));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded._id);
    if (!user) return next(new Error("User not found"));

    socket.user = user;
    next();
  } catch (err) {
    console.log("Socket auth failed:", err.message);
    return next(new Error("Invalid token"));
  }
});


io.on("connection", (socket) => {
  const userId = socket.user?._id.toString();
  if (!connectedUsers.has(userId)) {
    connectedUsers.add(userId);
    io.emit("liveUsers", connectedUsers.size);
    console.log(`User connected: ${userId}`);
  }

  socket.on("disconnect", () => {
    connectedUsers.delete(userId);
    io.emit("liveUsers", connectedUsers.size);
    console.log(`User disconnected: ${userId}`);
  });
});


httpServer.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});