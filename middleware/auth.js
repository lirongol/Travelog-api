import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

const auth = async (req, res, next) => {
   try {
      const token = req.headers.auth;
      if (token) {
         const decodedData = jwt.verify(token, 'test');
         req.userId = decodedData?.id;
         next();
      } else {
         res.status(401).json({ message: 'Unauthorized' });
      }
   } catch (error) {
      console.log('Auth Error', error);
   }
}

export default auth;