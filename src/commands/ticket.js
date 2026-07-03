const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelType,
} = require('discord.js');
const config = require('../../config.json');

const categoryOptions = config.categories.map(cat => ({
  name: cat.label,
  value: cat.name,
}));

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ticket')
    .setDescription('Gère les tickets de support')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
    .addSubcommand(subcommand =>
      subcommand
        .setName('setup')
        .setDescription('Configure le panneau de création de tickets')
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('create')
        .setDescription('Crée un nouveau ticket')
        .addStringOption(option =>
          option
            .setName('category')
            .setDescription('Catégorie du ticket')
            .setRequired(true)
            .addChoices(...categoryOptions)
        )
        .addStringOption(option =>
          option
            .setName('subject')
            .setDescription('Sujet du ticket')
            .setRequired(true)
        )
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('close')
        .setDescription('Ferme le ticket actuel')
        .addBooleanOption(option =>
          option
            .setName('transcript')
            .setDescription('Créer une transcription ?')
            .setRequired(false)
        )
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('add')
        .setDescription('Ajoute un utilisateur au ticket')
        .addUserOption(option =>
          option
            .setName('user')
            .setDescription('Utilisateur à ajouter')
            .setRequired(true)
        )
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('remove')
        .setDescription('Retire un utilisateur du ticket')
        .addUserOption(option =>
          option
            .setName('user')
            .setDescription('Utilisateur à retirer')
            .setRequired(true)
        )
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('help')
        .setDescription('Affiche l\'aide des tickets')
    ),

  async execute(interaction, client) {
    const subcommand = interaction.options.getSubcommand();

    if (subcommand === 'setup') {
      await handleSetup(interaction);
    } else if (subcommand === 'create') {
      await handleCreate(interaction);
    } else if (subcommand === 'close') {
      await handleClose(interaction);
    } else if (subcommand === 'add') {
      await handleAdd(interaction);
    } else if (subcommand === 'remove') {
      await handleRemove(interaction);
    } else if (subcommand === 'help') {
      await handleHelp(interaction);
    }
  },
};

async function handleSetup(interaction) {
  const embed = new EmbedBuilder()
    .setColor(config.colors.primary)
    .setTitle('🎫 Système de Tickets')
    .setDescription('Cliquez sur un bouton ci-dessous pour créer un ticket')
    .addFields(
      ...config.categories.map(cat => ({
        name: `${cat.emoji} ${cat.label}`,
        value: `Crée un ticket de type ${cat.label.toLowerCase()}`,
        inline: true,
      }))
    )
    .setFooter({ text: 'Ticket Bot v1.0.0' });

  const buttons = new ActionRowBuilder()
    .addComponents(
      ...config.categories.map(cat =>
        new ButtonBuilder()
          .setCustomId(`create_ticket_${cat.name}`)
          .setLabel(cat.label)
          .setEmoji(cat.emoji)
          .setStyle(ButtonStyle.Primary)
      )
    );

  await interaction.reply({
    embeds: [embed],
    components: [buttons],
  });

  await interaction.followUp({
    content: '✅ Panneau de tickets configuré !',
    ephemeral: true,
  });
}

async function handleCreate(interaction) {
  const category = interaction.options.getString('category');
  const subject = interaction.options.getString('subject');
  const categoryData = config.categories.find(c => c.name === category);

  const ticketNumber = Math.floor(Math.random() * 10000);
  const channelName = `ticket-${category}-${ticketNumber}`;

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
        allow: ['ViewChannel', 'SendMessages', 'ReadMessageHistory'],
      },
    ],
  });

  const embed = new EmbedBuilder()
    .setColor(config.colors.success)
    .setTitle(`${categoryData.emoji} Nouveau Ticket`)
    .setDescription(`Ticket créé par ${interaction.user}`)
    .addFields(
      { name: '📌 Catégorie', value: categoryData.label, inline: true },
      { name: '🔢 Numéro', value: `#${ticketNumber}`, inline: true },
      { name: '📝 Sujet', value: subject, inline: false },
      {
        name: '⏰ Créé le',
        value: `<t:${Math.floor(Date.now() / 1000)}:f>`,
        inline: true,
      }
    )
    .setFooter({ text: `ID: ${ticketChannel.id}` });

  const closeButton = new ActionRowBuilder()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('close_ticket')
        .setLabel('Fermer le ticket')
        .setEmoji('🔒')
        .setStyle(ButtonStyle.Danger)
    );

  await ticketChannel.send({
    embeds: [embed],
    components: [closeButton],
  });

  await interaction.reply({
    content: `✅ Ticket créé : ${ticketChannel}`,
    ephemeral: true,
  });
}

async function handleClose(interaction) {
  const ticketData = {
    closedBy: interaction.user.tag,
    closedAt: new Date().toLocaleString('fr-FR'),
    channel: interaction.channel.name,
  };

  const embed = new EmbedBuilder()
    .setColor(config.colors.error)
    .setTitle('🔒 Ticket Fermé')
    .setDescription('Ce ticket a été fermé')
    .addFields(
      { name: 'Fermé par', value: ticketData.closedBy, inline: true },
      { name: 'Date', value: ticketData.closedAt, inline: true }
    );

  await interaction.reply({ embeds: [embed] });

  setTimeout(async () => {
    await interaction.channel.delete().catch(console.error);
  }, 5000);
}

async function handleAdd(interaction) {
  const user = interaction.options.getUser('user');

  await interaction.channel.permissionOverwrites.edit(user, {
    ViewChannel: true,
    SendMessages: true,
    ReadMessageHistory: true,
  });

  const embed = new EmbedBuilder()
    .setColor(config.colors.success)
    .setTitle('➕ Utilisateur Ajouté')
    .setDescription(`${user} a été ajouté au ticket`)
    .setTimestamp();

  await interaction.reply({ embeds: [embed] });
}

async function handleRemove(interaction) {
  const user = interaction.options.getUser('user');

  await interaction.channel.permissionOverwrites.edit(user, {
    ViewChannel: false,
    SendMessages: false,
    ReadMessageHistory: false,
  });

  const embed = new EmbedBuilder()
    .setColor(config.colors.warning)
    .setTitle('➖ Utilisateur Retiré')
    .setDescription(`${user} a été retiré du ticket`)
    .setTimestamp();

  await interaction.reply({ embeds: [embed] });
}

async function handleHelp(interaction) {
  const embed = new EmbedBuilder()
    .setColor(config.colors.info)
    .setTitle('📖 Aide - Système de Tickets')
    .setDescription('Voici comment utiliser le système de tickets')
    .addFields(
      {
        name: '/ticket setup',
        value: 'Configure le panneau de création de tickets',
        inline: false,
      },
      {
        name: '/ticket create',
        value: 'Crée un nouveau ticket',
        inline: false,
      },
      {
        name: '/ticket close',
        value: 'Ferme le ticket actuel',
        inline: false,
      },
      {
        name: '/ticket add @user',
        value: 'Ajoute un utilisateur au ticket',
        inline: false,
      },
      {
        name: '/ticket remove @user',
        value: 'Retire un utilisateur du ticket',
        inline: false,
      }
    )
    .setFooter({ text: 'Ticket Bot v1.0.0' });

  await interaction.reply({ embeds: [embed], ephemeral: true });
}
