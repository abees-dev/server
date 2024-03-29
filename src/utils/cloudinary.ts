import { UploadApiResponse, v2 } from 'cloudinary';
import { unlink } from 'fs';
import { InternalServerError } from '../lib/Errors';
import { MulterFile, MulterFiles } from '../types/MulterType';

const cloudinary = v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

interface UploadResponse {
  public_id: string;
  url: string;
}

export const singleUpload = async (file: MulterFile, publicId: string | number): Promise<UploadResponse> => {
  const upload: UploadApiResponse = await cloudinary.uploader.upload(file.path, {
    overwrite: true,
    public_id: `user_${publicId}`,
  });

  unlink(file.path, (err) => {
    if (err) {
      throw new InternalServerError(err.message);
    }
  });

  return {
    url: upload.secure_url,
    public_id: upload.public_id,
  };
};

export const multipleUpload = async (files: MulterFiles): Promise<UploadResponse[]> => {
  const uploads = await Promise.all(
    files.map(async (file) => {
      const upload: UploadApiResponse = await cloudinary.uploader.upload(file.path);

      unlink(file.path, (err) => {
        if (err) {
          throw new InternalServerError(err.message);
        }
      });
      return {
        url: upload.secure_url,
        public_id: upload.public_id,
      };
    })
  );

  return uploads;
};

export default cloudinary;
