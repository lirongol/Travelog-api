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
   try {
      return await Promise.all(base64Array.map(async (file) => {
         const uploadRes = await cloudinary.uploader.upload(
            file,
            { resource_type: 'image', upload_preset: 'posts_media' }
         );
         return { url: uploadRes.secure_url, filename: uploadRes.public_id };
      }))
   } catch (err) {
      return { err };
   }
}

export const uploadPostVideo = async (base64Video) => {
   try {
      const uploadRes = await cloudinary.uploader.upload(
         base64Video,
         { resource_type: 'video', upload_preset: 'posts_video' }
      );
      return [{ url: uploadRes.secure_url, filename: uploadRes.public_id }];
   } catch (err) {
      return { err };
   }
}

export const uploadProfileImg = async (base64Img) => {
   try {
      const uploadRes = await cloudinary.uploader.upload(
         base64Img,
         { resource_type: 'image', upload_preset: 'profile_img' }
      );
      return { url: uploadRes.secure_url, filename: uploadRes.public_id };
   } catch (err) {
      return { err };
   }
}