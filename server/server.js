const path = require("path");
const http = require("http");
const express = require("express");
const socketIO = require("socket.io");

const {isRealString} = require("./utils/validation");
const {Users} = require("./utils/users");
const {generateMessage,generateLocationMessage} = require("./utils/message");
const publicPath = path.join(__dirname,"../public");
const port = process.env.PORT || 3000;

var app = express();
var server = http.createServer(app);
var io = socketIO(server);
var users = new Users();



app.use(express.static(publicPath));

io.on("connection",(socket) => {   //CONNECTİON DURUMUNDA SOCKETİMİZLE EMİT VE ON İŞLEMLERİ YAPACAĞIZ.
    console.log("New user connected");

    
 
    socket.on("join",(params,callback) => {   //CHat.js te ki johin emitiyle burayı yak
        if(!isRealString(params.name) || !isRealString(params.room)){  // Gerçek string değilse oda adı veya name hata callbacki yolla ve girme
            return callback("Name and room name are required");
        }
       
        socket.join(params.room);  // Diğer durumda oda adıyla join ol.
        users.removeUser(socket.id);
        users.addUser(socket.id,params.name,params.room); 

        io.to(params.room).emit("updateUserList",users.getUserList(params.room));

        socket.emit("newMessage",generateMessage("Admin","Welcome to the chat app"));  //NEW MESSAGE TAGİNİ EMİT EDİP GENERATE MESSAGE İLE MESAJ OLUŞTURDUK.
        socket.broadcast.to(params.room).emit("newMessage",generateMessage("Admin",params.name+" has connected!"));   //YENİ BİR KULLANICI GELİNCE ESKİ KULLANICILARA BİLGİ GİDİYOR.
        
        callback();
    });

    socket.on("createMessage",(message,callback) => {      //CreateMessage kullanılarak gelen mesajı newMessage ile emit ettik.
        var user = users.getUser(socket.id);

        if(user && isRealString(message.text)) {
            io.to(user.room).emit("newMessage",generateMessage(user.name,message.text));
        }
        callback();
    });

    socket.on("createLocationMessage",(coords) => {    //İNDEX.JS TE EMİT ETTİĞİMİZ CREATELOCATİONMESSAGEYİ burda alıyoruz ve 
        var user = users.getUser(socket.id);
        if(user) {
            io.to(user.room).emit("newLocationMessage",generateLocationMessage(user.name,coords.latitude,coords.longitude));   //newLocationMessage olarak tekrar emit ediyoruz.
        }

    });
    
    socket.on("disconnect",() => {    //DİSCONNECT OLUNDUĞU ZAMAN
        var user = users.removeUser(socket.id);

        if(user) {
            io.to(user.room).emit("updateUserList",users.getUserList(user.room));
            io.to(user.room).emit("newMessage",generateMessage("Admin",user.name+" has left!"));
        }
    });
});

server.listen(port,() => {
    console.log("Server is running on port ",port);
});