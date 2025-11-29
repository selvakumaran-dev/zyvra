const bcrypt = require('bcryptjs');

const testPassword = async () => {
    const plainPassword = 'admin123';

    // Test hashing
    const hash = await bcrypt.hash(plainPassword, 10);
    console.log('Plain password:', plainPassword);
    console.log('Generated hash:', hash);

    // Test comparison
    const isMatch = await bcrypt.compare(plainPassword, hash);
    console.log('Does it match?', isMatch);

    // Test with existing hash from DB (system@zyvra.com)
    const existingHash = '$2b$10$pEY7hK7tZRRIzwGwQjOJNOqGzPxqYjZ4mJFZXQxZxZxZxZxZxZxZx';
    console.log('\nTesting with password "admin123":');
    const match1 = await bcrypt.compare('admin123', existingHash);
    console.log('Match:', match1);
};

testPassword();
