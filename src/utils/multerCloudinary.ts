import multer from 'multer';

export const uploadMemory = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
  fileFilter: (req, file, cb) => {
    const ext = file.originalname.toLowerCase();
    if (!ext.match(/\.(jpg|jpeg|png|webp)$/)) {
      cb(new Error('Only images are allowed'));
      return;
    }
    cb(null, true);
  },
});
