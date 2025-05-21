import fs from 'fs';
import multer from 'multer';
import path from 'path';

export const uploadMemoryDisk = multer({
  storage: multer.memoryStorage(),
});
// console.log(path.resolve())

const diskStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, new Date().getTime() + '_' + file.originalname);
  },
});

export const uploadDiskStorage = multer({ storage: diskStorage });
