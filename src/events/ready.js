const { ActivityType } = require('discord.js');

module.exports = {
  name: 'ready',
  once: true,
  execute(client) {
    console.log(`✅ Bot connecté en tant que ${client.user.tag}`);
    
    client.user.setActivity({
      name: '/ticket help',
      type: ActivityType.Watching,
    });

    console.log(`🎫 Ticket Bot v1.0.0 est prêt !`);
  },
};
