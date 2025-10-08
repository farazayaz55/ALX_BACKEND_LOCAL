const { getCompressedUrl, getInfo, deleteFileOnBasisOfUrl } = require("../services/compressionService")

//either send existing doc, or new doc , or don't compress video if it's less than 100mb send null
const compressionCtrl={
    getURL:async(req,res)=>{
        const doc=await getCompressedUrl(req.body.url,req.body.height,req.body.width)
        console.log("GOT DOC",doc)
        return res.status(200).json(doc)
    },


    getInfo:async(req,res)=>{
        const doc=await getInfo(req.body.url)
        if(doc)
        return res.status(200).json(doc)   
        else
        return res.status(201).send(null)
    },

    delete:async(req,res)=>{
        const doc=await deleteFileOnBasisOfUrl(req.body.url)
        return res.status(200).send(doc)
    },

}

module.exports=compressionCtrl