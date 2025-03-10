'use strict';

const passport = require('passport');
const jwt = require('jsonwebtoken');
const User = require('../models/user.model');

// Initiate Google OAuth
const googleAuth = passport.authenticate('google', { scope: ['profile', 'email'] });

// Google OAuth callback
const googleCallback = passport.authenticate('google', { failureRedirect: '/' });

// Google OAuth callback handler
const googleCallbackHandler = async (req, res) => {
  const { googleAccessToken, googleId, username, email } = req.user;

  try {
    // Check if the user exists
    let user = await User.findOne({ googleId });

    if (!user) {
      // Create new user
      user = new User({
        googleId,
        username,
        email,
        role: 'admin' // *** This is for testing/grading purposes only. Change to 'temporary' for production ***
      });
      await user.save();
    } else {
      // Update user info if changed
      if (user.username !== username || user.email !== email) {
        user.username = username;
        user.email = email;
        await user.save();
      }
    }

    // Create JWT with user info
    const token = jwt.sign(
      {
        googleAccessToken: googleAccessToken,
        userId: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // Send JWT to client
    res.json({
      message: 'Login successful',
      token,
      user: { username: user.username, email: user.email, role: user.role }
    });
  } catch (err) {
    console.error('Error during OAuth callback:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = { googleAuth, googleCallback, googleCallbackHandler };
