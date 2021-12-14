/* eslint-disable no-useless-escape */
/* eslint-disable security/detect-unsafe-regex */
const regexPatterns = {
  uuidv4: /^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i,
  slug: /^[^\s!?/.*#|]+$/i,
  phoneNumber: /^\d{10}$/,
  email:
    // eslint-disable-next-line security/detect-unsafe-regex
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/,
  postalCode: /^\d{1,6}$/,
  cardCvv: /^\d{3}$/,
  cardExpiration: /^(0[1-9]|1[0-2])\/?([0-9]{4}|[0-9]{2})$/m,
  cardHolder: /^((?:[A-Za-z]+ ?){1,3})$/,
  filename: /^[\w,\s-]+\.[A-Za-z]{3}$/,
  path: /(\/.*|[a-zA-Z]:\\(?:([^<>:"\/\\|?*]*[^<>:"\/\\|?*.]\\|..\\)*([^<>:"\/\\|?*]*[^<>:"\/\\|?*.]\\?|..\\))?)/g,
};

module.exports = regexPatterns;
