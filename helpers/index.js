export const parseName = name => {
   const trimmed = name.trim();
   return trimmed[0].toUpperCase() + trimmed.slice(1, trimmed.length).toLowerCase();
}

export const parseUsername = username => {
   return username.replace(/ /g, '').toLowerCase();
}

export const checkSpacialChar = s => {
   const regex = /[-_=+'`~;!@#$%^&*(),.?":{}|<>\\/[\]]/;
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
   const tags = [...new Set(text.split(' ').filter(s => s[0] === '#'))]
      .map(tag => tag.slice(1, tag.length).toLowerCase())
      .filter(tag => !checkSpacialChar(tag) && tag.length < 20 && tag);
   return tags;
}