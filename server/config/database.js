const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
    
    // Create or update admin user
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
    const hashedPassword = await bcrypt.hash(adminPassword, 12);
    
    // --- TEMPORARY DEBUG CHANGE: Force upsert of admin user ---
    // This will create the admin if it doesn't exist, or update its password if it does.
    const result = await User.findOneAndUpdate(
      { email: adminEmail },
      { 
        name: 'Admin',
        password: hashedPassword,
        role: 'admin',
        isActive: true
      },
      { 
        upsert: true, // Create if not found
        new: true,    // Return the updated document
        setDefaultsOnInsert: true // Apply defaults if creating new
      }
    );
    // --- END TEMPORARY DEBUG CHANGE ---

    if (result) {
      console.log(`Default admin user ensured: ${adminEmail}. Password updated/set.`);
    } else {
      console.log('Failed to ensure default admin user.');
    }
  } catch (error) {
    console.error('Error creating/updating default admin:', error);
  }
};

module.exports = connectDB;
