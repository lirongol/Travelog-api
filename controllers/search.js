import * as error from '../helpers/errorMsg.js';
import User from '../models/user.js';
import App from '../models/app.js';

export const search = async (req, res) => {
   const limit = 5;
   let { q } = req.query;
   for (let char of q) {
      if (/[=+'`~;!@#$%^&*(),.?":{}|<>\\/[\]]/.test(q)) {
         q = q.replace(/[=+'`~;!@#$%^&*(),.?":{}|<>\\/[\]]/, '');
      }
   }
   q = q.trim();
   try {
      const user = await User.findById(req.userId);
      if (!user) return res.status(401).json({ msg: error.unauthorized });
      
      const regex = new RegExp(String(q), 'i');

      // profiles search
      const profiles = await User.find({
         $or: [
            { firstName: { $regex: regex } },
            { lastName: { $regex: regex } },
            { username: { $regex: regex } },
            { fullName: { $regex: regex } }
         ]
      })
         .select(['username', 'fullName', 'profileImg', '-_id'])
         .limit(limit);

      // tags search
      const { tags } = await App.findOne().select(['tags', '-_id']);
      const tagsArray = [];
      for (let tag in tags) {
         if (regex.test(tag) && tagsArray.length < limit) {
            tagsArray.push([tag, tags[tag].length]);
         }
      }
      tagsArray.sort((a, b) => b[1] - a[1]);

      if (!profiles.length && !tagsArray.length) return res.status(200).json({ msg: 'no results' });

      res.status(200).json({ profiles, tags: tagsArray });
   } catch (err) {
      res.status(500).json({ msg: error.server });
   }
}