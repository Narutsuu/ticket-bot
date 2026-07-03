const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelType,
} = require('discord.js');
const config = require('../../config.json');

module.exports = {
  customId: /^ticket_modal_.+$/,
  async execute(interaction) {
    const category = interaction.customId.split('_')[2];
    const categoryData = config.categories.find(c => c.name === category);
    const subject = interaction.fields.getTextInputValue('ticket_subject');
    const description = interaction.fields.getTextInputValue('ticket_description');

    await interaction.deferReply({ ephemeral: true });

    try {
      const ticketNumber = Math.floor(Math.random() * 100000);
      const channelName = `${category}-${ticketNumber}`;

      // Créer le canal
      const ticketChannel = await interaction.guild.channels.create({
        name: channelName,
        type: ChannelType.GuildText,
        topic: `Ticket #${ticketNumber} | ${subject}`,
        permissionOverwrites: [
          {
            id: interaction.guild.roles.everyone,
            deny: ['ViewChannel'],
          },
          {
            id: interaction.user.id,
            allow: ['ViewChannel', 'SendMessages', 'ReadMessageHistory', 'AttachFiles'],
          },
        ],
      });

      // Embed du ticket
      const ticketEmbed = new EmbedBuilder()
        .setColor(config.colors.success)
        .setTitle(`${categoryData.emoji} ${categoryData.label} - #${ticketNumber}`)
        .setDescription('Merci d\'avoir créé un ticket ! Un modérateur répondra bientôt.')
        .addFields(
          { name: '👤 Créé par', value: `${interaction.user}`, inline: true },
          { name: '📌 Catégorie', value: categoryData.label, inline: true },
          { name: '📝 Sujet', value: subject, inline: false },
          { name: '📄 Description', value: description, inline: false },
          {
            name: '⏰ Date',
            value: `<t:${Math.floor(Date.now() / 1000)}:f>`,
            inline: true,
          }
        )
        .setFooter({ text: `Ticket ID: ${ticketChannel.id}` });

      // Boutons d'action
      const actionButtons = new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder()
            .setCustomId('close_ticket')
            .setLabel('Fermer')
            .setEmoji('🔒')
            .setStyle(ButtonStyle.Danger),
          new ButtonBuilder()
            .setCustomId('add_user')
            .setLabel('Ajouter quelqu\'un')
            .setEmoji('➕')
            .setStyle(ButtonStyle.Primary)
        );

      await ticketChannel.send({
        embeds: [ticketEmbed],
        components: [actionButtons],
      });

      // Répondre à l'utilisateur
      await interaction.editReply({
        content: `✅ Ticket créé avec succès ! ${ticketChannel}`,
      });

      // Log
      console.log(`🎫 Ticket créé: #${ticketNumber} (${category}) par ${interaction.user.tag}`);

    } catch (error) {
      console.error('Erreur lors de la création du ticket:', error);
      await interaction.editReply({
        content: '❌ Une erreur s\'est produite lors de la création du ticket !',
      });
    }
  },
};
