const express = require('express');
const {getCategoryTotal,getSummary,getMonthlyTrends,getRecentActivity} = require('../controllers/dashboard.js');
const dashboard = express.Router();
const {requireRole} = require('../middleware/requirerole.js');
const { jwtAuthentication, attachUser } = require('../middleware/jwtverifyication.js');
 
dashboard.use(jwtAuthentication, attachUser);

dashboard.get('/summary', requireRole('viewer', 'analyst', 'admin'), getSummary);
dashboard.get('/categories',requireRole('viewer', 'analyst', 'admin'), getCategoryTotal);
dashboard.get('/trends',requireRole('viewer', 'analyst', 'admin'), getMonthlyTrends);
dashboard.get('/recent-activity',requireRole('viewer', 'analyst', 'admin'), getRecentActivity);


module.exports = dashboard;
