const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require('discord.js');
const config = require('../../config.json');

module.exports = {
  customId: 'close_ticket',
  async execute(interaction) {
    // Vérifier les permissions
    if (!interaction.member.permissions.has('ManageMessages')) {
      return await interaction.reply({
        content: '❌ Vous n\'avez pas la permission de fermer ce ticket !',
        ephemeral: true,
      });
    }

    const confirmEmbed = new EmbedBuilder()
      .setColor(config.colors.warning)
      .setTitle('⚠️ Confirmer la fermeture')
      .setDescription('Êtes-vous sûr de vouloir fermer ce ticket ?')
      .setFooter({ text: 'Cette action ne peut pas être annulée' });

    const confirmButton = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('confirm_close_ticket')
          .setLabel('Confirmer')
          .setStyle(ButtonStyle.Danger),
        new ButtonBuilder()
          .setCustomId('cancel_close_ticket')
          .setLabel('Annuler')
          .setStyle(ButtonStyle.Secondary)
      );

    await interaction.reply({
      embeds: [confirmEmbed],
      components: [confirmButton],
      ephemeral: true,
    });
  },
};
