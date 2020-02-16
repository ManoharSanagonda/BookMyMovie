import multer from 'multer';
import fs from 'fs';

import config from '../config/config';

/**
 * Storing Uploades file
 * @return {uploded file name}
 */
let storage = multer.diskStorage({
  destination: function (req, file, callback) {
    if (!fs.existsSync(config.upload[req.uploadPath])) {
      fs.mkdirSync(config.upload[req.uploadPath])
    }
    callback(null, config.upload[req.uploadPath]);
  },
  filename: function (req, file, callback) {
    let ext = '';
    let name = '';
    if (file.originalname) {
      let p = file.originalname.lastIndexOf('.');
      ext = file.originalname.substring(p + 1);
      let firstName = file.originalname.substring(0, p + 1);
      name = Date.now() + '_' + firstName;
      name += ext;
    }
    req.uploadFile.push({ name: name });
    if (req.uploadFile && req.uploadFile.length > 0) {
      callback(null, name);
    }
  }
});

const upload = multer({
  storage: storage
}).array('file');


export default {
  upload
}