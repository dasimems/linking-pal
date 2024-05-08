import multer from "multer";

const videoStorage = multer.diskStorage({
  destination: "videos", // Destination to store video
  filename: (req, file, cb) => {
    const fileExt = file.originalname.split(".").pop();
    const filename = `${file.fieldname}_${new Date().getTime()}.${fileExt}`;
    cb(null, filename);
  }
});

const imageStorage = multer.diskStorage({
  // Destination to store image
  destination: "images",
  filename: (req, file, cb) => {
    const fileExt = file.originalname.split(".").pop();
    const filename = `${file.fieldname}_${new Date().getTime()}.${fileExt}`;
    cb(null, filename);
  }
});

export const imageUpload = (limit: number = 2000000) =>
  multer({
    storage: imageStorage,
    limits: {
      fileSize: limit // defaults = 1 MB
    },
    fileFilter(req, file, cb) {
      if (!file.originalname.match(/\.(png|jpg)$/)) {
        return cb(new Error("Please upload a JPG or PNG Image"));
      }
      cb(null, true);
    }
  });

export const videUpload = (limit: number = 10000000) =>
  multer({
    storage: videoStorage,
    limits: {
      fileSize: limit // defaults = 10 MB
    },
    fileFilter(req, file, cb) {
      // upload only mp4 and mkv format
      if (!file.originalname.match(/\.(mp4|MPEG-4|mkv)$/)) {
        return cb(new Error("Please upload a video"));
      }
      cb(null, true);
    }
  });
