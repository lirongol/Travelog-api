import dotenv from 'dotenv';
import { v2 as cloudinary } from 'cloudinary';

dotenv.config();
cloudinary.config({ 
   cloud_name: process.env.CLOUDINARY_NAME, 
   api_key: process.env.CLOUDINARY_API_KEY, 
   api_secret: process.env.CLOUDINARY_API_SECRET
});

export default cloudinary;

export const uploadPostMedia = async (base64Array) => {
   return await Promise.all(base64Array.map(async (file) => {
      let uploadRes = await cloudinary.uploader.upload(
         file,
         { upload_preset: 'posts_media' }
      );
      return { url: uploadRes.url, filename: uploadRes.public_id };
   }))
}
