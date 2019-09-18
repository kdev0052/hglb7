const crypto = require('crypto')
const generatePassword = (length, useLower, useUpper, useNumbers, useSymbols, useAmbiguous) => {
  const getRandomFloat = () => {
    // https://stackoverflow.com/questions/34575635/cryptographically-secure-float#answer-34577886
    // TODO maybe change this in the future
    const buffer = new ArrayBuffer(8);
    const ints = new Uint8Array(buffer);
     crypto.randomFillSync(ints);
    ints[7] = 63;
    ints[6] |= 0xf0; // eslint-disable-line
    return new DataView(buffer).getFloat64(0, true) - 1;
  };

  const getRandomChar = str => str[Math.round(getRandomFloat() * (str.length - 1))];

  function shuffleArray(a) {
    const c = a;
    let i;
    let t;
    let j;
    for (i = c.length - 1; i > 0; i -= 1) {
      t = c[i];
      j = Math.floor(Math.random() * (i + 1));
      c[i] = c[j];
      c[j] = t;
    }
    return c;
  }

  if (!useLower && !useUpper && !useLower && !useNumbers && !useSymbols) {
    return '';
  }

  const upper = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const lower = 'abcdefghjkmnpqrstuvwxyz';
  const numbers = '123456789';
  const symbols = '!@#$%^&*';
  const ambiguousUpper = 'ABCDEFGHJKLMNPQRSTUVWXYZIO';
  const ambiguousLower = 'abcdefghjkmnpqrstuvwxyzilo';
  const ambiguousNumbers = '1234567890';
  let list = '';
  let password = '';

  if (useAmbiguous && useUpper) {
    list += upper;
    password += getRandomChar(upper);
  }
  if (useAmbiguous && useLower) {
    list += lower;
    password += getRandomChar(lower);
  }
  if (useAmbiguous && useNumbers) {
    list += numbers;
    password += getRandomChar(numbers);
  }
  if (useSymbols) {
    list += symbols;
    password += getRandomChar(symbols);
  }
  if (!useAmbiguous && useUpper) {
    list += ambiguousUpper;
    password += getRandomChar(ambiguousUpper);
  }
  if (!useAmbiguous && useLower) {
    list += ambiguousLower;
    password += getRandomChar(ambiguousLower);
  }
  if (!useAmbiguous && useNumbers) {
    list += ambiguousNumbers;
    password += getRandomChar(ambiguousNumbers);
  }

  const finalLength = length - password.length;

  for (let i = 1; i <= finalLength; i++) {
    password += getRandomChar(list);
  }

  return shuffleArray(password.split('')).join('');
};

exports.generatePassword = generatePassword