const {mongoose} = require("../db/mongoose");
const {validator}  = require("validator");

var userSchema = new mongoose.Schema({
    userName:{
        type:String,
        required:true,
        trim:true,
        minlength:3,
        maxlength:12
    },
    email:{
        type:String,
        required:true,
        trim:true,
        unique:true
    },
    password:{
        type:String,
        trim:true,
        required:true,
        minlength:6,
        tokens:{
            access:{
                type:String,
                required:true
            },
            token:{
                type:String,
                required:true
            }
        }
    }
});



var user = mongoose.model("users",userSchema);

module.exports = {user};