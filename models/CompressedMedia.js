const mongoose=require("mongoose")

const mediaSchema=new mongoose.Schema({
    url:{
        type:String,
        unique:true
    },

    newSize:{
        type:Number
    },
    newUrl:{
        type:String,
        unique:true
    },
    compressionInProgess:{
      type:Boolean
    },


})

mediaSchema.pre("save", function (next) {
    for (const path in this.schema.paths) {
      if (this[path] === null || (typeof this[path] === "number" && isNaN(this[path]))) {
        return next(new Error(`Invalid data. The field '${path}' is required and should not be null or NaN.`));
      }
    }
    next();
  });


  module.exports=mongoose.model("Media",mediaSchema)