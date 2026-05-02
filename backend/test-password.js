const bcrypt = require('bcryptjs');

const password = 'password123';
const hash = '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYIeWEHrHnK';

console.log('Testing password:', password);
console.log('Against hash:', hash);

bcrypt.compare(password, hash, (err, result) => {
  if (err) {
    console.error('Error:', err);
  } else {
    console.log('Match:', result);
  }
  
  // Also generate a new hash
  bcrypt.hash(password, 12, (err, newHash) => {
    if (err) {
      console.error('Error generating hash:', err);
    } else {
      console.log('New hash:', newHash);
    }
  });
});
