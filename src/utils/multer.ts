// import multer from "multer";

// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, 'uploads/'); // make sure this folder exists or handle it dynamically
//   },
//   filename: function (req, file, cb) {
//     // e.g. user-12345-timestamp.ext
//     const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
//     const extension = file.originalname.split('.').pop();
//     cb(null, `${file.fieldname}-${uniqueSuffix}.${extension}`);
//   },
// });
// export const upload = multer({ storage });




import multer from 'multer';
import path from 'path';

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

export const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
  fileFilter: function (req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ext !== '.jpg' && ext !== '.jpeg' && ext !== '.png' && ext !== '.webp') {
       cb(new Error('Only images are allowed'));
       return;
    }
    cb(null, true);
  },
});
