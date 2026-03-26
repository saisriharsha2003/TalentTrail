require('dotenv').config();
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
app.use(function (request, response, next) {
    response.header("Access-Control-Allow-Origin", "*");
    response.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
  });


app.use(express.urlencoded({ extended: false }));

app.use(express.json());

app.use(cookieParser());

app.use('/resumes', express.static('resumes'));

app.use('^/', require('./routes/user'));

app.use(verifyJWT);

app.use('/student', require('./routes/student'));

app.use('/recruiter', require('./routes/recruiter'));

app.use('/college', require('./routes/college'));

app.use('/admin', require('./routes/admin'));

app.all('*', (req, res) => {
    res.status(404).json({ 'message': 'PAGE-NOT-FOUND' });
});

app.use((err, req, res, next) => {
    console.log(err.stack);
    res.status(500).json({ 'message': err.message });
});

mongoose.connection.once('open', () => {
    console.log('mongodb connected');
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});