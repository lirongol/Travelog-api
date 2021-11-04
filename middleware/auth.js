import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

const auth = async (req, res, next) => {
   try {
      const token = req.headers.token;
      if (token) {
         const decodedData = jwt.verify(token, process.env.JWT_SECRET);
         req.userId = decodedData?.id;
         next();
      } else {
         res.status(401).json({ msg: 'Unauthorized' });
      }
   } catch (err) {
      console.log('JWT - token not valid')
      res.status(401).json({ msg: 'Unauthorized' });
   }
}

export default auth;