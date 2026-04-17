const express = require('express');
const app = express();
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/dbConn.js');
const verifyJWT = require('./middleware/verifyJWT.js');
const PORT = process.env.PORT || 3500;

require('dotenv').config({
  path: require('path').resolve(__dirname, '../.env')
});

connectDB();

const corsOptions = {
  origin: "http://localhost:5173",
  credentials: true
};

app.use(cors(corsOptions));

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cookieParser());

app.use('/resumes', express.static('resumes'));

app.use('/', require('./routes/user'));
app.use('/public', require('./routes/public'));

app.use(verifyJWT);

app.use('/student', require('./routes/student'));
app.use('/recruiter', require('./routes/recruiter'));
app.use('/college', require('./routes/college'));
app.use('/admin', require('./routes/admin'));

app.use((req, res) => {
  res.status(404).json({ message: 'PAGE-NOT-FOUND' });
});

mongoose.connection.once('open', () => {
  console.log('Connected to MongoDB');
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});