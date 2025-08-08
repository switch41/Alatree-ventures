const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
    
    // Create admin user ONLY if it doesn't exist
    await createDefaultAdmin();
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
};

const createDefaultAdmin = async () => {
  try {
    const User = require('../models/User');
    const bcrypt = require('bcryptjs');
    
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
    
    // Check if an admin user already exists
    const adminExists = await User.findOne({ email: adminEmail, role: 'admin' });
    
    if (!adminExists) {
      const hashedPassword = await bcrypt.hash(adminPassword, 12);
      
      await User.create({
        name: 'Admin',
        email: adminEmail,
        password: hashedPassword,
        role: 'admin',
        isActive: true
      });
      
      console.log(`Default admin user created with email: ${adminEmail}.`);
    } else {
      console.log('Default admin user already exists.');
      // Optional: If you want to ensure the password is always the .env one,
      // you could add logic here to update it if it's different, but generally
      // for production, you'd manage passwords through the UI after initial setup.
      // For now, we just ensure it exists.
    }
  } catch (error) {
    console.error('Error creating default admin:', error);
  }
};

module.exports = connectDB;
