'use strict';

const indexController = {};

indexController.buildIndex = async function (req, res) {
  res.json({
    message: 'Welcome to the SugarRush API',
    available_routes: {
      '/api-docs': 'View the API documentation'
    }
  });
};

module.exports = indexController;
