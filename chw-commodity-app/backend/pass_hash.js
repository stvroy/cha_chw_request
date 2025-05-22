const bcrypt = require('bcrypt');

async function generateHash() {
  const saltRounds = 10;
  const password = 'james123!';  // your hardcoded password here
  const hash = await bcrypt.hash(password, saltRounds);
  console.log(hash);
}

generateHash();