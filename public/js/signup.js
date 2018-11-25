var socket = io();

$("#kayit").click(function(){
   var userName = $("#name").val();
   var password = $("#password").val();
   var email = $("#email").val();

   socket.emit("userDB",userName,password,email);    //EMİT İLE USERDB ADINDAKİ ŞEYE VERİLERİ YOLLADIK.

   socket.on("correctMessage",function(message) {
        alert(message);
   });
});