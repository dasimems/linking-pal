import multer from "multer";

const videoStorage = multer.diskStorage({
  destination: "files/videos", // Destination to store video
  filename: (req, file, cb) => {
    const fileExt = file.originalname.split(".").pop();
    const filename = `${file.fieldname}_${new Date().getTime()}.${fileExt}`;
    cb(null, filename);
  }
});
const postStorage = multer.diskStorage({
  destination: "files/post", // Destination to store video
  filename: (req, file, cb) => {
    const fileExt = file.originalname.split(".").pop();
    const filename = `${file.fieldname}_${new Date().getTime()}.${fileExt}`;
    cb(null, filename);
  }
});

const imageStorage = multer.diskStorage({
  // Destination to store image
  destination: "files/images",
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

export const postUpload = (limit: number = 10000000) =>
  multer({
    storage: postStorage,
    limits: {
      fileSize: limit // defaults = 10 MB
    },
    fileFilter(req, file, cb) {
      // upload only mp4 and mkv format
      if (!file.originalname.match(/\.(mp4|MPEG-4|mkv|png|jpg)$/)) {
        return cb(new Error("Please upload a valid video or image file"));
      }
      cb(null, true);
    }
  });
