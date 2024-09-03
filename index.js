import express from "express";
import cors from "cors";
import multer from "multer";
import { v4 as uuidv4 } from "uuid";
import path from "path";
import fs from "fs";
import { exec , spawn} from "child_process";
import { BlobServiceClient } from "@azure/storage-blob";

const AZURITE_CONNECTION_STRING = "DefaultEndpointsProtocol=http;AccountName=devstoreaccount1;AccountKey=Eby8vdM02xNOcqFlqUwJPLlmEtlCDXJ1OUzFT50uSRZ6IFsuFq2UVErCz4I6tq/K1SZFPTOtr/KBHBeksoGMGw==;BlobEndpoint=http://127.0.0.1:10000/devstoreaccount1;";
const blobServiceClient = BlobServiceClient.fromConnectionString(AZURITE_CONNECTION_STRING);

const app = express();

// Multer configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads");
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + "-" + uuidv4() + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

app.use(
  cors({
    origin: ["http://localhost:3000", "http://localhost:5173"],
    credentials: true
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static("uploads"));

app.get('/', function (req, res) {
  res.json({ message: "Hello chai aur code" });
});

app.post("/upload", upload.single("file"), async function (req, res) {
  const ffmpegArgs = [
    '-loglevel', 'debug',  // Set log level to debug
    '-i', req.file.path,   // Input file
    '-c:v', 'libx264',     // Video codec
    '-c:a', 'aac',         // Audio codec
    '-f', 'hls',           // Output format (HLS)
    '-hls_time', '10',     // Segment duration
    '-hls_list_size', '0', // Store all segments
    '-'
];

console.log(ffmpegArgs)

// Spawn the FFmpeg process
const ffmpegProcess = spawn('ffmpeg', ffmpegArgs);

// Stream the FFmpeg output
ffmpegProcess.stdout.on('data', (data) => {
    console.log('Output:', data.toString()); // Process the stdout data (e.g., stream it somewhere)
});

// Handle any errors
ffmpegProcess.
stderr.on('data', (data) => {
    console.error('Error:', data.toString()); // Process the stderr data (e.g., log errors)
});

// Detect when the FFmpeg process is finished
ffmpegProcess.on('close', (code) => {
    console.log(`FFmpeg process exited with code ${code}`);
});
  // const lessonId = uuidv4();
  // const videoPath = req.file.path;
  // const containerName = "videos";
  // const containerClient = blobServiceClient.getContainerClient(containerName);
  // await containerClient.createIfNotExists();

  // const segmentFilenamePattern = `segment%03d.ts`;
  // const hlsPath = `index.m3u8`;

  // const ffmpegCommand = `ffmpeg -i ${videoPath} -codec:v libx264 -codec:a aac -hls_time 10 -hls_playlist_type vod -hls_segment_filename "pipe:1/segment%03d.ts" -start_number 0 pipe:1/index.m3u8`;

  // const uploadSegment = async (data, fileName) => {
  //   const blockBlobClient = containerClient.getBlockBlobClient(`${lessonId}/${fileName}`);
  //   await blockBlobClient.upload(data, data.length);
  // };

  // const child = exec(ffmpegCommand, { maxBuffer: 1024 * 500 }, async (error, stdout, stderr) => {
  //   if (error) {
  //     console.log(`exec error: ${error}`);
  //     if (!res.headersSent) {
  //       return res.status(500).json({ error: "Video processing failed" });
  //     }
  //     return;
  //   }
  // });

  // let currentSegmentIndex = 0;
  // child.stdout.on('data', async (data) => {
  //   if (data.includes('index.m3u8')) {
  //     await uploadSegment(data, hlsPath);
  //   } else {
  //     const fileName = segmentFilenamePattern.replace('%03d', String(currentSegmentIndex).padStart(3, '0'));
  //     await uploadSegment(data, fileName);
  //     currentSegmentIndex++;
  //   }
  // });

  // child.on('close', async () => {
  //   try {
  //     await containerClient.setAccessPolicy('container');

  //     const videoUrl = `http://127.0.0.1:10000/devstoreaccount1/videos/${lessonId}/index.m3u8`;

  //     // Clean up the temporary file
  //     fs.unlinkSync(videoPath);

  //     if (!res.headersSent) {
  //       res.json({
  //         message: "Video converted to HLS format and uploaded to blob storage",
  //         videoUrl: videoUrl,
  //         lessonId: lessonId
  //       });
  //     }
    // } catch (err) {
    //   if (!res.headersSent) {
    //     res.status(500).json({ error: "Error setting container access policy" });
    //   }
    // }
  // });
});

app.listen(8000, function () {
  console.log("App is listening at port 8000...");
});
