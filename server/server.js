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

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch((err) => console.error('MongoDB Connection Error:', err));

app.use('/api/user', userRouter);
app.use('/api/trips', tripRouter);
app.use('/api/bags', bagRouter)
app.use('/api/categories', categoryRouter)
app.use('/api/items', itemRouter)
app.use('/api/articles', articleRouter)
app.use('/api/changelogs', changeLogRouter)

app.get('/', (req, res) => {
  res.send('Server is running!');
});

app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
