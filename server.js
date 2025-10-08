const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const path = require("path");
const fileUpload = require("express-fileupload");
const bodyParser = require("body-parser");
const mqtt = require('mqtt');

const compressionRoutes = require("./routes/compressRoutes");
const canvasEditior = require("./routes/canvasEditiorRoutes");
const psdRoute = require("./routes/psdEditor");

const logger = require("./config/logger");
const httpStatus = require("http-status");

const { errorConverter, errorHandler } = require("./middleware/errorHandler");
const ApiError = require("./utils/ApiError");
const morgan = require("./config/morgan");
const config = require("./config/config");
const WebSocket = require("ws");
const { default: axios } = require("axios");
const connectedDevices = [];
const db = require("./firebase_db");
const { stat } = require("fs");

const app = express();

app.use(express.json());

app.use(cookieParser());
app.use(
  cors({
    origin: "*",
    methods: "GET,POST,PUT,DELETE,PATCH",
    credentials: true,
  })
);
app.use(fileUpload());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json({ limit: "500mb" }));
app.use(express.raw({ limit: '500mb', type: 'application/octet-stream' }));
app.use("/v1/compression", compressionRoutes);
app.use("/v1/psd", psdRoute);
app.use("/v1/canvas", canvasEditior);

app.use(express.static("public"));

app.use((req, res, next) => {
  next(new ApiError(httpStatus.NOT_FOUND, `ROUTE Not found ${req.originalUrl}`));
});

if (config.env !== "test") {
  app.use(morgan.successHandler);
  app.use(morgan.errorHandler);
}

// convert error to ApiError, if needed
app.use(errorConverter);

// handle error
app.use(errorHandler);

//proxy

const wss = new WebSocket.Server({ port: 8080, host: "0.0.0.0" });
const wss2 = new WebSocket.Server({ port: 9090, host: "0.0.0.0" });

const PING_INTERVAL = 30000; // 30 seconds
const PONG_TIMEOUT = 30000; // 30 seconds

const wsfn = (ws, port) => {
  let hexCode = null;
  let _deviceInfo = {};
  let _updateTime; //bool
  // console.log("Client connected :",port);
  let pongTimeout;
  let interval;
  let fireStoreListener;
  // let fireStoreStatusValue;

  ws.on("message", (message) => {
    try {
      //      console.log("message", message.toString());
      if (message == "pong") {
        //      console.log("PONG RECEIVED:", hexCode);
        // if (fireStoreStatusValue == false) {
        //   console.log(
        //     "pong received but in db status was false for",
        //     hexCode,
        //     " setting to online again"
        //   );
        //   axios.post(`${config.FIREBASEURL}/updateStatusDevice`, {
        //     hexcode: hexCode,
        //     status: "online",
        //   });
        // }
        clearInterval(pongTimeout);
      } else {
        let data;
        if (message.toString().split(":")[0] != "HEX" && JSON.parse(message.toString()).Hex) {
          //this is gonna run if we are on getting device data version of App
          const msg = JSON.parse(message.toString());
          data = {
            hexCode: msg.Hex,
          };
          const { updateTime, version, device } = msg;
          _deviceInfo = device;
          _deviceInfo.version = version;
          _updateTime = updateTime;


        } else {
          //hex can be null if SplashProvider not set correctly
          if (message.toString().split(":")[0] != "HEX" && JSON.parse(message.toString()).Hex == null) {
            return;
          }
          data = {
            hexCode: message,
          };
        }
        if (data.hexCode) {
          hexCode = data.hexCode.toString();
          if (hexCode.split(":")[0] == "HEX") {
            //this is gonna run if we are on version where we first implemented Ping Pong
            hexCode = hexCode.split(":")[1]; // remove HEX: from string
          }
          if (connectedDevices.find((hexCodeItr) => hexCodeItr == hexCode)) {
            console.log("Already connected", hexCode);
            return;
          }

          else {
            connectedDevices.push(hexCode);
          }
          console.log(`Received hexCode from ${hexCode} :${port}`);
          pingPongStart(); // set ping pong

          //         const docRef = db
          //           .collection("networkDevices")
          //           .where("hexCode", "==", hexCode);

          //         docRef.get().then((docs) => {
          //           if (!docs.empty) {
          //             const doc = docs.docs[0];
          //             const id = doc.id;
          //             fireStoreListener = db
          //               .collection("networkDevices")
          //               .doc(id)
          //               .collection("userstatistics")
          //               .doc(id)
          //               .onSnapshot((val) => {
          //                 if (val.exists) {
          //                   const data = val.data();
          //                   fireStoreStatusValue = data.isOnline;
          //                   console.log("DB Status update", hexCode, data.isOnline);
          //                 } else {
          //                   console.log("no user stat found");
          //                 }
          //               });
          //           } else {
          //             console.log("No such document!", hexCode);
          //           }
          //         }).catch((error) => {
          //   console.error("Error fetching Firestore document:", error);
          // });;

          if (_deviceInfo) {
            axios.post(`${config.FIREBASEURL}/updateStatusDevice`, {
              hexcode: hexCode,
              status: "online",
              deviceInfo: _deviceInfo,
              updateTime: _updateTime,
            });
          } else {
            axios.post(`${config.FIREBASEURL}/updateStatusDevice`, {
              hexcode: hexCode,
              status: "online",
            });
          }
        } else {
          console.log(
            `No hexCode found in the initial message from ${hexCode} : ${port}`
          );
        }
      }
    } catch (error) {
      console.error(`Error parsing initial message from ${hexCode}:`, error);
    }
  });

  //AFTER EACH PING INTERVAL I WILL SEND A PING
  //AFTER SENDING A PING I WILL SET PONG TIMEOUT IF NO PING GET'S RECEIVED I WILL CLOSE THE INTERVAL
  function pingPongStart() {
    // console.log("Ping Pong Func");
    interval = setInterval(function ping() {
      ws.send("ping"); // Send a ping frame
      //      console.log("Ping sent to client:", hexCode);

      pongTimeout = setTimeout(() => {
        console.log("No pong received, closing connection ", hexCode, port);
        ws.close(1001, "No Pong Received"); // Close the connection immediately
        clearInterval(interval);
        clearTimeout(pongTimeout);
      }, PONG_TIMEOUT);
    }, PING_INTERVAL);
  }

  ws.on("close", (code, reason) => {
    connectedDevices.splice(connectedDevices.indexOf(hexCode), 1);
const reasonStr = Buffer.isBuffer(reason) ? reason.toString('utf8') : reason;

    console.log("Code is ", code, reasonStr,hexCode);
    clearInterval(interval); // Clear the ping interval
    clearTimeout(pongTimeout);
    // const docRef = db
    //   .collection("networkDevices")
    //   .where("hexCode", "==", hexCode);

    // docRef.get().then((docs) => {
    //   if (!docs.empty) {
    //     const doc = docs.docs[0];
    //     const docData = doc.data();

    //     db.collection("companies")
    //       .doc(docData.companyID)
    //       .get()
    //       .then((companyDoc) => {
    //         if (companyDoc.exists) {
    //           const companyData = companyDoc.data();

    //           axios.post("https://us-central1-alxconnect.cloudfunctions.net/sendEmailCrashes", {
    //             message: `Device ${hexCode} crashed, code is ${code}, name is ${docData.playerName}, and company is ${companyData.name} reason ${reasonStr} `,
    //           }).then(() => {
    //             console.log("Crash email sent successfully.");
    //           }).catch((err) => {
    //             console.error("Error sending crash email:", err);
    //           });
    //         } else {
    //           console.error("Company document not found.");
    //         }
    //       }).catch((err) => {
    //         console.error("Error fetching company document:", err);
    //       });

    //   } else {
    //     console.error("Device not found for hexCode:", hexCode);
    //   }
    // }).catch((err) => {
    //   console.error("Error querying networkDevices:", err);
    // });

    //normally code is 1005
    //1000 is for paused
    if (code == 1000) {
      axios.post(`${config.FIREBASEURL}/updateStatusDevice`, {
        hexcode: hexCode,
        status: "offline",
        updateTime: false,
      });
    } else {

      // if (code == 1006) {
      //   console.log("It's a crash");
      // }
      axios.post(`${config.FIREBASEURL}/updateStatusDevice`, {
        hexcode: hexCode,
        status: "offline",
        updateTime: true,
      });
    }
    // if (fireStoreListener) fireStoreListener();
    if (ws) {
      ws.terminate(); // Force close WebSocket to prevent memory leaks
    }
    console.log(`Client disconnected: ${hexCode} ${port}`);
  });
}

wss.on("connection",
  (ws) => wsfn(ws, "8080")
);

wss2.on("connection", (ws) => wsfn(ws, "9090"));

//MQTT
const client = mqtt.connect('mqtt://broker.emqx.io'); // Replace with your broker
client.on('connect', () => {
  console.log('MQTT Connected');
  client.subscribe('status/+', (err) => {
    if (!err) console.log('Subscribed to device statuses');
  });
});

client.on('message', (topic, message) => {
  console.log(`Received from ${topic}: ${message.toString()}`);
  // You can parse and store it to Firebase/Firestore here
  const [_, hexCodeWithEpochs] = topic.split('/');
  if(_!='status')
	return


 const msgString=message.toString();
if (!msgString.includes('"status"')) {
  console.warn('Message does not contain status:', msgString);
  return;
}
  const status = JSON.parse(message.toString());
  const hexCode = hexCodeWithEpochs.split('-')[0];

  console.log(`HexCode: ${hexCode} and ${status.status}`);
  

  // console.log(status.status=="online");

    axios.post(`${config.FIREBASEURL}/updateStatusDevice`, {
      hexcode: hexCode,
      status: status.status,
    });


  })



mongoose.connect(config.mongoose.url, config.mongoose.options).then(() => {
  logger.info("Connected to MongoDB");
  server = app.listen(config.port, () => {
    logger.info(`Listening to port ${config.port}`);
  });
});

module.exports = app;
