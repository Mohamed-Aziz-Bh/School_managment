const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
require('dotenv').config();
const app = express();
// Middlewares
app.use(cors());
app.use(bodyParser.json());
// MongoDB Connection
mongoose
.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
.then(() => console.log('MongoDB connected'))
.catch(err => console.error(err));
// Routes
const authRoutes = require('./routes/auth');
const coursRoutes = require('./routes/cours');
const scheduleRoutes = require('./routes/schedules');
const messageRoutes = require('./routes/messages');
const notesRoutes = require('./routes/notes');
const absencesRoutes = require('./routes/absences');
app.use('/api/auth', authRoutes);
app.use('/api/cours', coursRoutes);
app.use('/api/schedule', scheduleRoutes);
app.use('/api/message', messageRoutes);
app.use('/api/notes', notesRoutes);
app.use('/api/absences', absencesRoutes);
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
// Start Server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));