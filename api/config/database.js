const mongoose = require('mongoose');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
    
    await createOrUpdateDefaultAdmin();
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
};

const createOrUpdateDefaultAdmin = async () => {
  try {
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
    
    let adminUser = await User.findOne({ email: adminEmail, role: 'admin' }).select('+password');

    if (!adminUser) {
      console.log('[DEBUG] Admin user not found — creating new one.');

      await User.create({
        name: 'Admin',
        email: adminEmail,
        password: adminPassword, // Let the pre-save hook hash it
        role: 'admin',
        isActive: true
      });

      console.log(`Default admin user created with email: ${adminEmail}`);
    } else {
      console.log('[DEBUG] Admin user already exists.');
      console.log(`[DEBUG] Stored hash in DB: ${adminUser.password}`);

      const isPasswordMatch = await bcrypt.compare(adminPassword, adminUser.password);

      if (!isPasswordMatch) {
        console.log('[DEBUG] Password mismatch — updating stored password.');
        adminUser.password = adminPassword; // Let the pre-save hook hash it
        await adminUser.save();
        console.log(`Default admin user password updated for ${adminEmail}`);
      } else {
        console.log('[DEBUG] Password matches — no update needed.');
      }
    }
  } catch (error) {
    console.error('Error creating or updating default admin:', error);
  }
};

module.exports = connectDB;