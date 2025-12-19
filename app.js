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


app.use(cors({
  origin: [
    'https://admin.merefunds.in'
  ],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Handle preflight requests
app.options('*', cors());



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