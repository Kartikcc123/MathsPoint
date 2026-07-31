const cron = require('node-cron');
const Advertisement = require('../models/Advertisement');

const scheduleAdvertisementJobs = () => {
  // Run every hour
  cron.schedule('0 * * * *', async () => {
    try {
      const now = new Date();

      // Activate scheduled ads that should start now
      await Advertisement.updateMany(
        { 
          status: 'scheduled', 
          startDate: { $lte: now } 
        },
        { status: 'active' }
      );

      // Deactivate ads that should end now
      await Advertisement.updateMany(
        { 
          status: 'active', 
          endDate: { $lte: now } 
        },
        { status: 'inactive' }
      );

      console.log('Cron Job: Advertisement statuses updated successfully');
    } catch (error) {
      console.error('Cron Job Error: Failed to update advertisement statuses', error);
    }
  });
};

module.exports = {
  scheduleAdvertisementJobs
};
