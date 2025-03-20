'use strict';

const User = require('../models/user.model');
const redisClient = require('../utilities/redisClient');
const axios = require('axios');
const jwt = require('jsonwebtoken');

// Retrieve all users with optional filtering (admins see all, others see themselves)
const getAllUsers = async (req, res) => {
  try {
    const query = {};

    // Apply optional filters
    if (req.query.role) {
      query.role = req.query.role;
    }
    if (req.query.name) {
      query.username = new RegExp(req.query.name, 'i'); // Case-insensitive search
    }

    let users = await User.find(query);

    // Only admins can see all users. Regular users can only see themselves.
    if (req.user.role !== 'admin') {
      users = users.filter((user) => user._id.toString() === req.user.userId);
    }

    // If no users are found after filtering, return 404
    if (!users || users.length === 0) {
      return res.status(404).json({ message: 'No matching users found' });
    }

    res.setHeader('Content-Type', 'application/json');
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ message: 'Error retrieving users', error: err.message });
  }
};

// Retrieve a single user (admins can see all users, others see themselves)
const getSingleUser = async (req, res) => {
  try {
    if (!req.params.id) {
      return res.status(400).json({ message: 'ID parameter is required' });
    }

    // Restrict access to the user themselves or an admin
    if (req.user.role !== 'admin' && req.user.userId !== req.params.id) {
      return res.status(403).json({ message: 'Only the user or an admin can view this user' });
    }

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.setHeader('Content-Type', 'application/json');
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ message: 'Error retrieving user', error: err.message });
  }
};

// Delete a user (only accessible by the user themselves or an admin)
const deleteSingleUser = async (req, res) => {
  try {
    if (!req.params.id) {
      return res.status(400).json({ message: 'ID parameter is required' });
    }

    if (req.user.role !== 'admin' && req.user.userId !== req.params.id) {
      return res.status(403).json({ message: 'Only the user or an admin can delete this account' });
    }

    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.setHeader('Content-Type', 'application/json');
    res.status(200).json({ message: 'User successfully deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete user', error: error.message });
  }
};

// Update user info (only accessible by the user or an admin)
const updateSingleUser = async (req, res) => {
  const { preferred_name, phone_number, role } = req.body;

  try {
    if (!req.params.id) {
      return res.status(400).json({ message: 'ID parameter is required' });
    }

    let user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Only admins can update roles
    if (role && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only admins can update user roles' });
    }

    // Only the user or an admin can update preferred_name or phone_number
    if (
      (preferred_name || phone_number) &&
      req.user.role !== 'admin' &&
      req.user.userId !== user._id.toString()
    ) {
      return res
        .status(403)
        .json({ message: 'Only the user or an admin can update this information' });
    }

    // Keep googleId unchanged
    const updateFields = {
      preferred_name: preferred_name ?? user.preferred_name,
      phone_number: phone_number ?? user.phone_number,
      role: role ?? user.role,
      googleId: user.googleId,
      username: user.username,
      email: user.email
    };

    user = await User.findByIdAndUpdate(req.params.id, updateFields, {
      new: true,
      runValidators: true
    });

    res.json({ message: 'User updated successfully', user });
  } catch (err) {
    res.status(500).json({ message: 'Error updating user', error: err.message });
  }
};

// Logout user and revoke OAuth token
const userLogout = async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(400).json({ message: 'Authorization header missing.' });
  }

  const token = authHeader.split(' ')[1]; // Extract JWT
  const googleToken = req.user?.googleAccessToken;

  try {
    // Revoke the Google OAuth token
    if (googleToken) {
      await axios.post(`https://oauth2.googleapis.com/revoke?token=${googleToken}`, null, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });
      console.log('Google access token revoked.');
    } else {
      console.warn('No Google access token found to revoke.');
    }

    // Blacklist the JWT
    const decoded = jwt.decode(token);
    if (!decoded) {
      return res.status(400).json({ message: 'Invalid JWT provided.' });
    }

    const expiresIn = decoded.exp - Math.floor(Date.now() / 1000); // Calculate token expiration

    if (expiresIn > 0) {
      await redisClient.set(token, 'blacklisted', { EX: expiresIn });
      console.log(`JWT blacklisted for ${expiresIn} seconds.`);
    } else {
      console.warn('JWT already expired.');
    }

    return res.status(200).json({
      message: 'User logged out successfully. JWT blacklisted and Google token revoked.'
    });
  } catch (err) {
    console.error('Logout error:', err.response?.data || err.message);
    return res.status(500).json({ message: 'Error logging out.' });
  }
};

module.exports = {
  getAllUsers,
  getSingleUser,
  deleteSingleUser,
  updateSingleUser,
  userLogout
};
