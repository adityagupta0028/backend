const express = require('express');
const connection = require("./configs/database")
const cors = require("cors");
const logger = require("morgan");
const bodyParser = require("body-parser");
const path = require("path");
require('dotenv').config();
 const v1Routes = require("./v1/routes/index");
const responses = require("./common/responses");

const app = express();
const PORT = process.env.PORT || 8081;
let server
if (process.env.NODE_ENV == "dev") {
  var https = require('https')
  var fs = require('fs');
  const options = {
    cert: fs.readFileSync('/'),
    key: fs.readFileSync('/')
  }
  server = https.createServer(options, app);
} else {
  server = require("http").createServer(app);
}
const apiRouter = express.Router();


// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, Postman, or curl requests)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      'https://admin.merefunds.in',
      'http://localhost:3000',
      'http://localhost:3001'
    ];
    
    // Check if origin is in allowed list or contains admin.merefunds.in
    if (allowedOrigins.indexOf(origin) !== -1 || origin.includes('admin.merefunds.in')) {
      callback(null, true);
    } else {
      // For development, you might want to allow all origins
      // For production, uncomment the line below to block unauthorized origins
      // callback(new Error('Not allowed by CORS'));
      callback(null, true); // Temporarily allow all for debugging
    }
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  credentials: true,
  preflightContinue: false,
  optionsSuccessStatus: 204
};

app.use(cors(corsOptions));


app.use(responses());
app.use(logger("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

app.get('/', (req, res) => {
    res.send('Backend API is running');
});


app.use("/api/v1", v1Routes);
app.use(express.static(path.join(__dirname, '/public')));
app.use('/public/files', express.static(__dirname + "/public/files"));
app.use("/uploads", express.static("uploads"));

// 404, Not Found
app.use((req, res, next) => res.error(404, "NOT_FOUND"));



app.use((error, req, res, next) => {
  return res.error(400, error.message || error);
});


server.listen(PORT, async ()=>{
    await connection();
    console.log(`Server is listening at port:${PORT}`);
})