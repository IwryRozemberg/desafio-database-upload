import multer from 'multer';
import path from 'path';
import crypto from 'crypto';

const defaultPath = path.resolve(__dirname, '..', '..', 'tmp');

export default {
  defaultPath,
  storage: multer.diskStorage({
    destination: defaultPath,
    filename(request, file, callback) {
      const fileSalt = crypto.randomBytes(16).toString('hex');
      callback(
        null,
        `Import_Transactions_${fileSalt}${path.extname(file.originalname)}`,
      );
    },
  }),
};
