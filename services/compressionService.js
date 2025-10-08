const ffmpeg = require("fluent-ffmpeg");
const fs = require("fs");
const axios = require("axios");
const CompressMediaMode = require("../models/CompressedMedia");
const config = require("../config/config");

require("dotenv").config();

//it get's firebase url checks if file is greater than 100 MB. it  compresses it
const getCompressedUrl = async (inputUrl, height, width) => {
  console.log("GOT ", inputUrl);
  const mediaFound = await CompressMediaMode.findOne({ url: inputUrl });
  console.log(!mediaFound);
  if (!mediaFound) {
    return new Promise(async (resolve, reject) => {
      try {
        const response = await axios.head(inputUrl);
        const contentLength = response.headers["content-length"];
        if (contentLength) {
          const sizeInBytes = parseInt(contentLength, 10);
          const sizeInKB = sizeInBytes / 1024; // Convert bytes to kilobytes
          const sizeInMB = (sizeInKB / 1024).toFixed(2); // Convert kilobytes to megabytes
          console.log(sizeInMB);
          ffmpeg.ffprobe(inputUrl, async (err, metadata) => {
            if (err) {
              console.error("Error retrieving video metadata: ", err);
              reject(err);
            }

            const videoStream = metadata.streams.find(
              (stream) => stream.codec_type === "video"
            );
            const bitrate = videoStream.bit_rate
              ? parseInt(videoStream.bit_rate, 10)
              : null;
            console.log(`Bitrate: ${bitrate} bps`);

            //if file >100mb compress else just don't compress nor make document . so we will use original firebase for it
            if (sizeInMB >=99 || (height >= 1080 && width >= 1920) || (bitrate/1000)>1000) {
              const parsedUrl = new URL(inputUrl);
              const pathParts = parsedUrl.pathname.split("/");
              const filename = pathParts[pathParts.length - 1];

              // Decode the filename
              const decodedFilename = decodeURIComponent(filename);
              const PathPartsOfUrl = decodedFilename.split("/");
              const UniquefilenamefromUrl =
                PathPartsOfUrl[PathPartsOfUrl.length - 1];
              const outputFilePath = `./public/${UniquefilenamefromUrl}`;

              const mediaDocCompression = new CompressMediaMode({
                url: inputUrl,
                newSize: 0,
                newUrl: `${config.SERVER_URL}/${UniquefilenamefromUrl}`,
                compressionInProgess: true,
              });

              await mediaDocCompression.save();

              // Compress the video using FFmpeg
              ffmpeg(inputUrl)
                .outputOptions("-c:v libx264")
                .outputOptions("-vf fps=25,scale=1920:1080")
                .outputOptions("-b:v 800k")
//                .outputOptions("-vf scale=1920:1080")
                .outputOptions(["-crf", "28"])
                .outputOptions("-preset superfast")
.outputOptions("-an")                         // Disable audio (silence the video)
                .on('progress', progress => {
    console.log(`Processing: ${progress.percent ? progress.percent.toFixed(2) : '??'}% done`);
  })

		.on("end", async () => {
                  console.log("Video compression complete.");

                  console.log(`Compressed video saved as ${outputFilePath}`);

                  // Get file sizes
                  const compressedSize = fs.statSync(outputFilePath).size;

                  console.log(`Compressed file size: ${compressedSize} bytes`);

                  const media = await CompressMediaMode.findByIdAndUpdate(
                    mediaDocCompression._id,
                    {
                      compressionInProgess: false,
                      newSize: compressedSize,
                    },
                    { new: true }
                  );
                })
                .on("error", (err) => {
                  console.error("Error while compressing video:", err);
                  reject(err);
                })
                .save(outputFilePath);

              resolve(mediaDocCompression);
            } else {
              console.log(
                "RETURNING  null because compression criteria not met "
              );
              resolve(null);
            }
          });
        }
      } catch (error) {
        reject(error);
      }
    });
  } else {
    return mediaFound;
  }
};

const getInfo = async (inputUrl) => {
  console.log("GOT INFO API GOT", inputUrl);
  const mediaFound = await CompressMediaMode.findOne({ url: inputUrl });
  if (!mediaFound) {
    return null;
  } else {
    return mediaFound;
  }
};

const deleteFileOnBasisOfUrl = async (inputUrl) => {
  console.log("GOT DELETE API GOT", inputUrl);
  const mediaFound = await CompressMediaMode.findOne({ url: inputUrl });
  if (!mediaFound) {
    return null;
  } else {
    if (mediaFound.compressionInProgess == true) {
      return mediaFound;
    }
    let path = mediaFound.newUrl;

    for (let i = 0; i < 3; i++) {
      const firstSlashIndex = path.indexOf("/");
      path = path.slice(firstSlashIndex + 1, path.length + 1);
    }
    let fileName = `./public/${path}`;
    // Decode URL-encoded characters
    const decodedFilePath = decodeURIComponent(fileName);
    // fs.unlink(decodedFilePath, (err) => {
    //   if (err) console.error(err);
    //   else {
    //     console.log("file deleted successfully")
    //     CompressMediaMode.findByIdAndDelete(mediaFound.id)
    //   }
    // });
    return "deleted";
  }
};

module.exports = {
  getCompressedUrl,
  getInfo,
  deleteFileOnBasisOfUrl,
};
