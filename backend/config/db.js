const mongoose = require('mongoose');
const dns = require('dns');

if(process.platform === 'win32') {dns.setServers(['8.8.8.8', '1.1.1.1']);} // Use Google/Cloudflare DNS for SRV resolution
 
async function connectDB() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB connected successfully');
    } catch (error) {
        console.error('MongoDB connection error:', error);
        process.exit(1); // Exit process with failure
    }
}
 
module.exports = connectDB;
