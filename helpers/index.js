export const parseName = name => {
   const trimmed = name.trim();
   return trimmed[0].toUpperCase() + trimmed.slice(1,trimmed.length).toLowerCase();
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