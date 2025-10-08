const fs = require("fs");
const path = require("path");
const db = require("../firebase_db");
const config = require("../config/config");

let update = true;
let localName = false;
let psdPath;
let pngPath;
let mediaIdGlobal;

const psdSave = (rawData, mediaId, companyId, userId) => {
  update = true;
  psdPath = undefined;
  pngPath = undefined;
  mediaIdGlobal = undefined;
  //format
  // json have this architecture

  // {
  //   "source" : "https://www.mysite.com/images/button.png",
  //   "versions" : [
  //     {"format":"psd", "start":      0, "size": 700000 },
  //     {"format":"jpg", "start": 700000, "size": 100000 },
  //     ...
  //   ]
  // }

  const jsonData = JSON.parse(rawData.slice(0, 2000).toString()); // check photopea doc starting 2000Bytes are json data
  let offset = 2000; // Starting point for image data
  mediaIdGlobal = mediaId;
  jsonData.versions.forEach((version) => {
    const { start, size, format } = version;
    if (format === "jpg") {
      return; //skip jpg file
    }
    const imageData = rawData.slice(offset + start, start + size); //used offset because 2000 bytes are json so skip those bytes
    createPSDMedia(imageData, format, jsonData, companyId, userId);
  });

  console.log("update is ", update);
  return update ? "updated" : "created";
};

const createPSDMedia = async (
  imageData,
  format,
  jsonData,
  companyId,
  userId
) => {
  if (mediaIdGlobal == undefined) {
    // if we are not passing mediaId means we are creating it
    mediaIdGlobal = Date.now(); // using current time as media id
    update = false; // creating media therofore false
  }

  localName = false;

  const imageFilePath = `./public/${format}/${companyId}/${userId}/${mediaIdGlobal}.${format}`;

  const directoryPath = path.dirname(imageFilePath); // Get the directory path

  // Ensure the directory exists, create it if not (recursive: true)
  if (!fs.existsSync(directoryPath)) {
    fs.mkdirSync(directoryPath, { recursive: true }); // This will create the folder and all necessary subfolders
  }
  //create file
  fs.writeFileSync(imageFilePath, imageData);

  if (format === "png") {
    pngPath = imageFilePath;
  } else {
    psdPath = imageFilePath;
  }

  //create or update DB
  let name;
  if (jsonData.source.includes(",")) {
    console.log(jsonData.source);
    name = jsonData.source.substring(jsonData.source.lastIndexOf(",") + 1);
    localName = true;
  }

  if (psdPath && pngPath) {
    let media;
    if (localName) {
      media = {
        id: mediaIdGlobal.toString(),
        name: name,
        type: "image/png",
        url: `${config.SERVER_URL}${pngPath
          .replace(".", "")
          .replace("/public", "")}`,
        user_id: userId,
        isPSD: true,
        psdURL: `${config.SERVER_URL}${psdPath
          .replace(".", "")
          .replace("/public", "")}`,
        length: "10",
        creationDate: new Date(),
        size: 0,
        height: 0,
        width: 0,
      };
      db.collection("companies")
        .doc(companyId)
        .collection("media")
        .doc(mediaIdGlobal.toString())
        .set(media);
    } else {
      db.collection("companies")
        .doc(companyId)
        .collection("media")
        .doc(mediaIdGlobal.toString())
        .get()
        .then((doc) => {
          const data = doc.data();
          if (data) {
            //change name and url as well
            name = data.name;
            let tempNameArr = name.split(".");
            let tempName = name.replace(
              tempNameArr[tempNameArr.length - 1],
              ""
            );
            tempName = tempName.replace("-", " ");
            tempName = tempName.replace("_", " ");

            tempName = tempName.replace(/[^a-zA-Z0-9 ]/g, "");
            tempName = tempName + " " + new Date().getTime();

            //changing url
            //changing url
            const newUrlObj = new URL(data.url);
            const versionParam = newUrlObj.searchParams.get("version");
            if (versionParam == null) {
              newUrlObj.searchParams.set("version", "1");
            } else {
              const newVersion = parseInt(versionParam) + 1;
              newUrlObj.searchParams.set("version", newVersion.toString());
            }

            db.collection("companies")
              .doc(companyId)
              .collection("media")
              .doc(mediaIdGlobal.toString())
              .update({ name: tempName, url: newUrlObj.toString() });
          }
        });
    }

    console.log("Saving", format, media);
  }
};

const deletePSDMedia = async (companyId, userId, mediaId) => {
  try {
    const formats = ["psd", "png"];
    const promises = formats.map((format) => {
      return new Promise((resolve, reject) => {
        const filePath = `./public/${format}/${companyId}/${userId}/${mediaId}.${format}`;

        fs.unlink(filePath, (err) => {
          if (err) {
            console.error(`Error deleting file: ${filePath}`, err);
            reject({
              status: 500,
              msg: `Error deleting ${mediaId}: ${err.message}`,
            });
          } else {
            console.log(`File Deleted successfully: ${filePath}`);
            resolve({
              status: 200,
              msg: `Deleted successfully: ${mediaId}`,
            });
          }
        });
      });
    });

    await Promise.all(promises);
    return { status: 200, message: "deleted successfully" };
  } catch (error) {
    return { status: 500, message: error.message };
  }
};

module.exports = {
  psdSave,
  deletePSDMedia,
};
