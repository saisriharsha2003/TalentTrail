const express = require('express');
const app = express();
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/dbConn.js');
const corsOptions = require('./config/corsOrigins.js');
const credentials = require('./middleware/credentials');
const verifyJWT = require('./middleware/verifyJWT.js');
const PORT = process.env.PORT || 3500;

require('dotenv').config({
  path: require('path').resolve(__dirname, '../.env')
});

connectDB();

// app.use(credentials);


app.use(cors());
// app.use((req, res, next) => {
//     const allowedOrigins = ['https://final-year-project-client-five.vercel.app', 'http://localhost:3000'];
//     const origin = req.headers.origin;
  
//     if (allowedOrigins.includes(origin)) {
//       res.setHeader('Access-Control-Allow-Origin', origin);
//     }
  
//     res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
//     res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
//     next();
//   });s
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));


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