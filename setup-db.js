const fs = require('fs');
const { execSync } = require('child_process');

const envContent = `DATABASE_URL="postgresql://postgresuser:g7uO5zQZt1gocHyVkpv70KhjKoJgMKQA@dpg-d59sokali9vc73ar440g-a.oregon-postgres.render.com/dssdesign"
JWT_SECRET="supersecret_jwt_key_change_me"
PORT=5000
RAZORPAY_KEY_ID="rzp_test_YOUR_KEY_ID"
RAZORPAY_KEY_SECRET="YOUR_KEY_SECRET"
EMAIL_SERVICE="gmail"
EMAIL_USER="your-email@gmail.com"
EMAIL_PASS="your-app-password"`;

try {
    console.log('Writing .env file...');
    fs.writeFileSync('.env', envContent);
    console.log('.env file written successfully.');

    console.log('Running Prisma generate...');
    execSync('npx prisma generate', { stdio: 'inherit' });

    console.log('Running Prisma migrate deploy...');
    execSync('npx prisma migrate deploy', { stdio: 'inherit' });

    console.log('Database setup complete.');
} catch (error) {
    console.error('Setup failed:', error.message);
    process.exit(1);
}
