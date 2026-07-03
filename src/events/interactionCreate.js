const { InteractionType } = require('discord.js');

module.exports = {
  name: 'interactionCreate',
  async execute(interaction, client) {
    // Handle slash commands
    if (interaction.isChatInputCommand()) {
      const command = client.commands.get(interaction.commandName);

      if (!command) {
        console.error(`Commande ${interaction.commandName} non trouvée`);
        return;
      }

      try {
        await command.execute(interaction, client);
      } catch (error) {
        console.error(error);
        if (interaction.replied || interaction.deferred) {
          await interaction.followUp({
            content: '❌ Une erreur s\'est produite lors de l\'exécution de cette commande !',
            ephemeral: true,
          });
        } else {
          await interaction.reply({
            content: '❌ Une erreur s\'est produite lors de l\'exécution de cette commande !',
            ephemeral: true,
          });
        }
      }
    }

    // Handle buttons
    if (interaction.isButton()) {
      const button = client.buttons.get(interaction.customId);

      if (!button) {
        console.error(`Button ${interaction.customId} non trouvé`);
        return;
      }

      try {
        await button.execute(interaction, client);
      } catch (error) {
        console.error(error);
        if (interaction.replied || interaction.deferred) {
          await interaction.followUp({
            content: '❌ Une erreur s\'est produite !',
            ephemeral: true,
          });
        } else {
          await interaction.reply({
            content: '❌ Une erreur s\'est produite !',
            ephemeral: true,
          });
        }
      }
    }

    // Handle modals
    if (interaction.isModalSubmit()) {
      const modal = client.modals.get(interaction.customId);

      if (!modal) {
        console.error(`Modal ${interaction.customId} non trouvé`);
        return;
      }

      try {
        await modal.execute(interaction, client);
      } catch (error) {
        console.error(error);
        if (interaction.replied || interaction.deferred) {
          await interaction.followUp({
            content: '❌ Une erreur s\'est produite !',
            ephemeral: true,
          });
        } else {
          await interaction.reply({
            content: '❌ Une erreur s\'est produite !',
            ephemeral: true,
          });
        }
      }
    }
  },
};
