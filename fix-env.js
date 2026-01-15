const fs = require('fs');
const url = 'postgresql://postgresuser:g7uO5zQZt1gocHyVkpv70KhjKoJgMKQA@dpg-d59sokali9vc73ar440g-a.oregon-postgres.render.com/dssdesign?sslmode=require';
const content = `DATABASE_URL=${url}
JWT_SECRET=supersecret_jwt_key_change_me
PORT=5000
RAZORPAY_KEY_ID=rzp_test_YOUR_KEY_ID
RAZORPAY_KEY_SECRET=YOUR_KEY_SECRET
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password`;
fs.writeFileSync('.env', content, 'utf8');
console.log('Updated .env without quotes.');
