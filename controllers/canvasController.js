const fs = require("fs");
const db=require('../firebase_db')

const saveData = async (req, res) => {
    const { id } = req.body;
    const imagePath = `./public/data/exports/${id}.png`;
    const jsonPath = `./public/data/templates/${id}.json`;
    try {
        await fs.promises.writeFile(imagePath, req.files.image.data);
        await fs.promises.writeFile(jsonPath, req.files.json.data);
        return res.status(200).json({ message: "Data saved successfully" });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Error in saving data" });
    }
};



const changeTemplateName=async(req,res)=>{
    console.log("change template called")
    if (req.method !== "POST") {
        return res.status(403).send("Forbidden: This HTTP method is not allowed");
    }

    try {
        const {templateId,companyId}=req.body
        db.collection('companies').doc(companyId).collection('media').doc(templateId).get().then(async (tempDoc)=>{
            const templateMedia=tempDoc.data();
          const indexOfLastSpace=templateMedia.name.trim().lastIndexOf(' ');
          let originalName
          if(indexOfLastSpace!=-1){
            const lastPart=templateMedia.name.trim().substring(indexOfLastSpace+1,templateMedia.name.length);
            const date=new Date(Number(lastPart))
            if(!isNaN(date.getTime())){
              //it's time
              originalName=templateMedia.name.trim().substring(0,indexOfLastSpace)
            }
            else{
              //don't change name
              originalName=templateMedia.name
            }
  
          }
          else
            originalName=templateMedia.name
          templateMedia.name=originalName+ ' ' + new Date().getTime();


          //also change the urls
          const url=templateMedia.url
          const newUrlObj = new URL(templateMedia.url);
          const versionParam = newUrlObj.searchParams.get("version");
          if (versionParam == null) {
            newUrlObj.searchParams.set("version", "1");
          } else {
            const newVersion = parseInt(versionParam) + 1;
            newUrlObj.searchParams.set("version", newVersion.toString());
          }

          templateMedia.url=newUrlObj.toString()
          templateMedia.thumbnailPath=newUrlObj.toString()


          db
          .collection("companies")
          .doc(companyId)
          .collection("media")
          .doc(templateMedia.id)
          .update(templateMedia);
    
          return res.status(200).send('updated')
        })
    } catch (error) {
        console.log(error);
        return res.status(500).send("Internal Server Error");
    }
}


module.exports = { saveData , changeTemplateName };
