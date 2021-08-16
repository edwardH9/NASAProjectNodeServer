const express= require('express')
const app =express()
const {missionData} = require('./missionData')

const mysql = require('mysql')
const session = require('express-session')
// var MySQLStore = require('express-mysql-session')(session);

require('dotenv').config()
const path= require('path')
const server=require('http').Server(app)
const videoStream = require('./videoStream');

const urlencodedParser = express.urlencoded({extended:false})
app.use(express.urlencoded({extended: false}))
app.use(express.json())

//ESP32 Cam feed
//
const WebSocket = require('ws')
const wss1 = new WebSocket.Server({noServer: true})
const wss2 = new WebSocket.Server({noServer: true})
var camArray=[];
wss1.on('connection', function connection(ws){
    ws.on('message', function incoming(message){
        wss2.clients.forEach(function each(client){
            if (client.readyState === WebSocket.OPEN){
                client.send('message')
            }
        })
    })
})

wss2.on('connection', function connection(ws) {
    ws.on('message', function incoming(message) {
        // nothing here should be received
      console.log('received wss2: %s', message);
    });
  });
  
  server.on('upgrade', function upgrade(request, socket, head) {
    const pathname = url.parse(request.url).pathname;
  
    if (pathname === '/jpgstream_server') {
      wss1.handleUpgrade(request, socket, head, function done(ws) {
        wss1.emit('connection', ws, request);
      });
    } else if (pathname === '/jpgstream_client') {
      wss2.handleUpgrade(request, socket, head, function done(ws) {
        wss2.emit('connection', ws, request);
      });
    } else {
      socket.destroy();
    }
  });
  
  app.get('/cameraTest', (req, res) => {
        res.render('theta', {});
  });

  //Alt orig
// console.log("Connected")
// connectedClients.push(ws)

// ws.on('message',data =>{
// connectedClients.forEach((ws,i)=>{
//         if(ws.readyState===ws.OPEN){
//             ws.send(data)
//         }else{
//             connectedClients.splice(i,1);
//         }
//     })
// });
//End esp32 cam


const dataLog = (req,res,next)=>{
    const time = new Date()
    console.log("-----------------")
    console.log("Visit: "+req.url)
    console.log("Time:")
    console.log(time)
    next()
}

app.use(dataLog)
app.use(express.static('public'))
app.use("/css",express.static(__dirname+ "public/css"))
app.set('views','./views')
app.set('view engine', 'ejs')

const routes = require('./server/routes/user')
app.use('/',routes)

videoStream.acceptConnections(app, {
    width: 1280,
    height: 720,
    fps: 16,
    encoding: 'JPEG',
    quality: 7 //lower is faster
}, '/stream.mjpg', true);

const pool = mysql.createPool({
    connectionLimit: 100,
    host: process.env.HOST,
    user: 'root',
    password: 'SProtocol934',
    database: process.env.DATABASE
});


pool.getConnection((err, connection)=>{
    if(err) throw err;
    console.log("Database Connected, ID:" + connection.threadId)
})

app.get('/cameraR', (req,res)=>{
    res.render("landFeedPg")
})

app.get('/cameraD', (req,res)=>{
    res.render("airFeedPg")
})

app.get('/camera3', (req,res)=>{
    res.sendFile(path.join(__dirname,"camera.html"))
})

app.get('/api/missionInformation',(req,res)=>{
    res.json(missionData)
})

app.get("/biologyApplications",(req,res)=>{
    res.render("biologyPage")
})


app.get("/delta",(req,res)=>{
    res.render("delta")
})

app.get("/development",(req,res)=>{
    res.render("dev")
})

//Route parameter method to query
app.get('/api/missionInformation/:missionNumber', (req,res)=>{
    const {missionNumber} = req.params
    const singleMission=missionData.find((mission) => mission.MissionNumber === Number(missionNumber))
    if(!singleMission){
        return res.status(404).send("Mission Number Does Not Exist")
    }
    res.json(singleMission)
})

//Query String
app.get('/api/query',dataLog,(req,res)=>{
    const {search,limit}=req.query
    let sortedMissions=[...missionData]
   
    if (search){
        sortedMissions=sortedMissions.filter((mission)=>{
            return mission.TeamLeader.startsWith(search)
        })
    }

    if(limit){
        sortedMissions=sortedMissions.slice(0,Number(limit))
    }

    if(sortedMissions<1){
        return res.status(200).send("No Missions matched the search")
    }
    res.status(200).json(sortedMissions)
})

app.get('/api',(req,res)=>{
    res.send(missionData)
})

app.all('*',(req,res)=>{
    res.status(404).send('Not found')
})

server.listen(5000,()=>{
    console.log('Mission: Start')
})

//B64 code for permissions pages: MzE3OWpnYi0yMTU=