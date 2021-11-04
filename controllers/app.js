import App from '../models/app.js';
import User from '../models/user.js';
import * as error from '../helpers/errorMsg.js';

export const getTags = async (req, res) => {
   try {
      const user = await User.findById(req.userId);
      if (!user) return res.status(401).json({ msg: error.unauthorized });

      const { tags } = await App.findOne()
         .select(['tags', '-_id']);
      
      const tagsArray = [];
      for (let tag in tags) {
         tagsArray.push([tag, tags[tag]])
      }
      tagsArray.sort((a,b) => b[1].length - a[1].length);
      
      res.status(200).json(tagsArray);
   } catch (err) {
      console.log(err);
      res.status(500).json({ msg: error.server });
   }
}
