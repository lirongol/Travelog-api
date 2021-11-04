export const parseName = name => {
   const trimmed = name.trim();
   return trimmed[0].toUpperCase() + trimmed.slice(1, trimmed.length).toLowerCase();
}

export const parseUsername = username => {
   return username.replace(/ /g, '').toLowerCase();
}

export const checkSpacialChar = s => {
   const regex = /[=+'`~;!@#$%^&*(),.?":{}|<>\\/[\]]/;
   return s.match(regex) ? true : false;
}

export const checkPhoneNumber = n => {
   const regex = /^[0-9]*$/;
   return !n.match(regex) ? true : false;
}

export const getHashtags = text => {
   while (text.includes('\n')) {
      text = text.replace('\n', ' ');
   }
   const tags = text.split(' ')
      .map(s => s.trim())
      .filter(s => s[0] === '#')
      .map(tag => tag.slice(1, tag.length).toLowerCase().trim())
      .filter(tag => !checkSpacialChar(tag) && tag.length < 20 && tag);
   return [ ...new Set(tags)];
}

export const calcScore = (upVotes, downVotes, createdAt) => {
   const votes = downVotes === 0 ? upVotes : upVotes / downVotes;
   const d = new Date();
   const daysNow = d.getFullYear() * 12 * 30 + d.getMonth() * 30 + d.getDate();
   const postDays = createdAt.getFullYear() * 12 * 30 + createdAt.getMonth() * 30 + createdAt.getDate();
   const daysAgo = daysNow - postDays;
   if (daysAgo === 0) {
      const hoursAgo = d.getHours() - createdAt.getHours();
      if (hoursAgo === 0) {
         const minutesAgo = d.getMinutes() - createdAt.getMinutes();
         return minutesAgo === 0 ? votes / (minutesAgo + 1) : votes / minutesAgo;
      } else {
         return votes / hoursAgo;
      }
   } else {
      return votes / daysAgo;
   }
}