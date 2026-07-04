module.exports = {
  name: 'ready',
  once: true,
  execute(client) {
    console.log(`\n✅ Bot connecté: ${client.user.tag}`);
    console.log(`🎫 Ticket Bot v1.0.0 prêt!\n`);
    client.user.setActivity('/ticket help • Gestion de tickets', { type: 'WATCHING' }).catch(() => {});
  },
};
