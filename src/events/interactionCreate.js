module.exports = {
  name: 'interactionCreate',
  async execute(interaction, client) {
    try {
      // Handle slash commands
      if (interaction.isChatInputCommand()) {
        const command = client.commands.get(interaction.commandName);
        if (!command) {
          console.error(`Command not found: ${interaction.commandName}`);
          return await interaction.reply({
            content: '❌ Cette commande n\'existe pas!',
            ephemeral: true,
          }).catch(() => {});
        }

        try {
          await command.execute(interaction, client);
        } catch (error) {
          console.error('Command execution error:', error);
          const errorMsg = { content: '❌ Erreur lors de l\'exécution de la commande!', ephemeral: true };
          if (interaction.replied || interaction.deferred) {
            await interaction.followUp(errorMsg).catch(() => {});
          } else {
            await interaction.reply(errorMsg).catch(() => {});
          }
        }
      }

      // Handle buttons
      if (interaction.isButton()) {
        const button = client.buttons.get(interaction.customId);
        if (!button) {
          console.error(`Button not found: ${interaction.customId}`);
          return;
        }

        try {
          await button.execute(interaction, client);
        } catch (error) {
          console.error('Button execution error:', error);
          const errorMsg = { content: '❌ Erreur!', ephemeral: true };
          if (interaction.replied || interaction.deferred) {
            await interaction.followUp(errorMsg).catch(() => {});
          } else {
            await interaction.reply(errorMsg).catch(() => {});
          }
        }
      }

      // Handle modals
      if (interaction.isModalSubmit()) {
        const modal = client.modals.get(interaction.customId);
        if (!modal) {
          console.error(`Modal not found: ${interaction.customId}`);
          return;
        }

        try {
          await modal.execute(interaction, client);
        } catch (error) {
          console.error('Modal execution error:', error);
          const errorMsg = { content: '❌ Erreur!', ephemeral: true };
          if (interaction.replied || interaction.deferred) {
            await interaction.followUp(errorMsg).catch(() => {});
          } else {
            await interaction.reply(errorMsg).catch(() => {});
          }
        }
      }
    } catch (error) {
      console.error('Interaction error:', error);
    }
  },
};
