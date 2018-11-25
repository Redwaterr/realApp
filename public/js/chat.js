var socket = io();

function scrollToBottom(){
    var messages = $("#messages");
    var newMessage = messages.children("li:last-child");

    var clientHeight = messages.prop("clientHeight");
    var scrollTop = messages.prop("scrollTop");
    var scrollHeight = messages.prop("scrollHeight");
    var newMessageHeight = newMessage.innerHeight();
    var lastMessageHeight = newMessage.prev().innerHeight();

    if(clientHeight + scrollTop + newMessageHeight + lastMessageHeight >= scrollHeight) {
        messages.scrollTop(scrollHeight);
    }
};


socket.on("connect",function() {       //BAĞLANTI SAĞLANDIĞINDA 
    var params = $.deparam(window.location.search);   //gelen parametreleri al 
    socket.emit("join",params,function (err) {    //Join emitini yak
        if(err) {
            alert(err);
            window.location.href = "/";
        } else {
            console.log("No error");
        }
    });
});

socket.on("disconnect",function() {
    console.log("Discnnect from server");
});


socket.on("updateUserList",function(users) {
    var ol = $("<ol></ol>");
    
    users.forEach(function (user) {
        ol.append($("<li></li>").text(user));
    });

    $("#users").html(ol);
});


socket.on("newMessage",function(message){   //newMessage tagiyle server.js te oluşturulmuş yeni mesajımızı alıp forma ekledik.
    var formattedTime = moment(message.createdAt).format("h:mm a");
    var template = $("#message-template").html();
   var html = Mustache.render(template,{
       text:message.text,
       from:message.from,
       createdAt:formattedTime
   });

   $("#messages").append(html);
   scrollToBottom();
   
   
   // var li = $("<li></li>");
   // li.text(message.from+" "+formattedTime+": "+message.text);
   // $("#messages").append(li);
});

socket.on("newLocationMessage",function(message){    //AŞAĞIDA BUTONA BASILINCA EMİT EDİP YENİ MESAJ OLUŞTURUYORUZ VE SONRA TEKRAR SERVER.JS TE newLOcationMessageyi emit edip bunu yakıyoruz.
    var formattedTime = moment(message.createdAt).format("h:mm a");
    var template = $("#location-message-template").html();
    var html = Mustache.render(template,{
        from:message.from,
        createdAt:formattedTime,
        url:message.url
    });
    $("#messages").append(html);
    scrollToBottom();
});

$("#message-form").on("submit",function(e) {      //JQUERY İLE FORMU SEÇİP EMİT İLE CREATEMESSAGE KULLANARAK GELEN MESAJI ALDIK.
    e.preventDefault();

    var messageTextbox = $("[name=message]");

    socket.emit("createMessage",{    //CREATE MESSAGE TAGI KULLANILARAK $NAME=MESSAGE İLE GELEN MESAJ ALINIP YENİ BİR MESAJ OLUŞTURULDU.
        text:messageTextbox.val()
    },function(){
        messageTextbox.val("")
    });
});


var locationButton = $("#send-location");     //LOCATİON BUTONA TIKLADIĞINDA  
locationButton.on("click",function() {      // yanıyor,
    if(!navigator.geolocation){               // EĞER DESTEKLEMİYORSA OLMUYOR
        return alert("Geolocation not supported your browser");
    }

    locationButton.attr("disabled","disabled").text("Sending location...");    //BUTONA BASILINCA DİSABLED YAPTIK.
    navigator.geolocation.getCurrentPosition(function(position){     //DAHA SONRA BİZİM POZİSYONUMUZU ALIP LOCATİON MESSAGE EMİTLEDİĞİNDE TEKRAR GÖRÜNÜR OLUYOR.
        locationButton.removeAttr("disabled").text("Send Location");
        socket.emit("createLocationMessage",{     // DEĞERLERİMİZİ EMİT ETTİK.
            latitude:position.coords.latitude,
            longitude:position.coords.longitude
        });
    },function(){
        alert("Unable to fetch location.");
    });
});