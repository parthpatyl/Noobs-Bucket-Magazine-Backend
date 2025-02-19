const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('./cloudinary.js');

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    const userId = req.params.id; 
    const folderPath = req.body.folder || `Magzine/`;
    return {
      folder: folderPath,
      resource_type: 'auto', 
      public_id: file.originalname.split('.')[0], 
    };
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, 
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only .pdf, .jpg, and .png files are allowed!'), false);
    }
  },
});

module.exports = upload;
