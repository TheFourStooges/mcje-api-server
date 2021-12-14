const path = require('path');
const multer = require('multer');
const mime = require('mime-types');
const config = require('../config/config');

const storage = multer.diskStorage({
  destination(_req, _file, cb) {
    // https://stackoverflow.com/questions/48418680/enoent-no-such-file-or-directory
    cb(null, path.join(process.cwd(), config.uploads.path));
  },
  filename(_req, _file, cb) {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const fileExtension = mime.extension(_file.mimetype);
    cb(null, `${_file.fieldname}-${uniqueSuffix}.${fileExtension}`);
  },
});

const upload = multer({ storage });

module.exports = upload;
