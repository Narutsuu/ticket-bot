module.exports = {
  name: 'messageCreate',
  async execute(message, client) {
    if (message.author.bot) return;
    
    const prefix = process.env.BOT_PREFIX || '!';
    if (!message.content.startsWith(prefix)) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    try {
      if (command === 'help' || command === 'h') {
        const { EmbedBuilder } = require('discord.js');
        const embed = new EmbedBuilder()
          .setColor('#5865F2')
          .setTitle('🎫 Ticket Bot - Commandes')
          .addFields(
            { name: '!help', value: 'Affiche cette aide', inline: false },
            { name: '!ping', value: 'Latence du bot', inline: false },
            { name: '!about', value: 'Info du bot', inline: false },
            { name: '!ticket setup', value: 'Configure le panneau', inline: false },
            { name: '!ticket create <cat> <sujet>', value: 'Crée un ticket (support, report, appeal, partnership)', inline: false },
            { name: '!ticket close', value: 'Ferme le ticket', inline: false },
            { name: '!ticket add @user', value: 'Ajoute un user', inline: false },
            { name: '!ticket remove @user', value: 'Retire un user', inline: false },
            { name: '!ticket list', value: 'Liste les tickets', inline: false }
          );
        return message.reply({ embeds: [embed] });
      }

      if (command === 'ping') {
        const { EmbedBuilder } = require('discord.js');
        const embed = new EmbedBuilder()
          .setColor('#57F287')
          .setTitle('🏓 Pong!')
          .addFields(
            { name: 'Bot', value: `${client.ws.ping}ms`, inline: true },
            { name: 'Message', value: `${Date.now() - message.createdTimestamp}ms`, inline: true }
          );
        return message.reply({ embeds: [embed] });
      }

      if (command === 'about') {
        const { EmbedBuilder } = require('discord.js');
        const embed = new EmbedBuilder()
          .setColor('#00B0F4')
          .setTitle('ℹ️ Ticket Bot')
          .addFields(
            { name: 'Version', value: '1.0.0', inline: true },
            { name: 'Dev', value: 'Narutsuu', inline: true },
            { name: 'Serveurs', value: client.guilds.cache.size.toString(), inline: true }
          );
        return message.reply({ embeds: [embed] });
      }

      if (command === 'ticket') {
        const subcommand = args[0]?.toLowerCase();
        const config = require('../../config.json');
        const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType } = require('discord.js');

        if (subcommand === 'setup') {
          if (!message.member.permissions.has('ManageMessages')) {
            return message.reply('❌ Permission denied!');
          }
          const embed = new EmbedBuilder()
            .setColor(config.colors.primary)
            .setTitle('🎫 Système de Tickets')
            .addFields(...config.categories.map(cat => ({
              name: `${cat.emoji} ${cat.label}`,
              value: `Crée un ticket ${cat.label.toLowerCase()}`,
              inline: true,
            })));
          const buttons = new ActionRowBuilder()
            .addComponents(...config.categories.map(cat =>
              new ButtonBuilder()
                .setCustomId(`create_ticket_${cat.name}`)
                .setLabel(cat.label)
                .setEmoji(cat.emoji)
                .setStyle(ButtonStyle.Primary)
            ));
          return message.reply({ embeds: [embed], components: [buttons] });
        }

        if (subcommand === 'create') {
          const category = args[1]?.toLowerCase();
          const subject = args.slice(2).join(' ');
          if (!category || !subject) return message.reply('❌ Usage: !ticket create <cat> <subject>');
          const categoryData = config.categories.find(c => c.name === category);
          if (!categoryData) return message.reply('❌ Catégorie invalide!');
          const ticketNumber = Math.floor(Math.random() * 100000);
          const ticketChannel = await message.guild.channels.create({
            name: `${category}-${ticketNumber}`,
            type: ChannelType.GuildText,
            topic: `Ticket #${ticketNumber} | ${subject}`,
            permissionOverwrites: [
              { id: message.guild.roles.everyone, deny: ['ViewChannel'] },
              { id: message.author.id, allow: ['ViewChannel', 'SendMessages', 'ReadMessageHistory', 'AttachFiles'] },
            ],
          });
          const embed = new EmbedBuilder()
            .setColor(config.colors.success)
            .setTitle(`${categoryData.emoji} Ticket #${ticketNumber}`)
            .addFields(
              { name: '👤 Créé par', value: message.author.toString(), inline: true },
              { name: '📌 Cat', value: categoryData.label, inline: true },
              { name: '📝 Sujet', value: subject, inline: false }
            );
          const buttons = new ActionRowBuilder()
            .addComponents(
              new ButtonBuilder().setCustomId('close_ticket').setLabel('Fermer').setEmoji('🔒').setStyle(ButtonStyle.Danger)
            );
          await ticketChannel.send({ embeds: [embed], components: [buttons] });
          return message.reply(`✅ Ticket créé: ${ticketChannel}`);
        }

        if (subcommand === 'close') {
          if (!message.member.permissions.has('ManageMessages')) return message.reply('❌ Permission denied!');
          const embed = new EmbedBuilder().setColor('#ED4245').setTitle('🔒 Fermé').addFields(
            { name: 'Par', value: message.author.tag, inline: true },
            { name: 'Date', value: new Date().toLocaleString('fr-FR'), inline: true }
          );
          message.reply({ embeds: [embed] });
          setTimeout(() => message.channel.delete().catch(() => {}), 3000);
        }

        if (subcommand === 'add') {
          if (!message.member.permissions.has('ManageMessages')) return message.reply('❌ Permission denied!');
          const user = message.mentions.users.first();
          if (!user) return message.reply('❌ Mention un utilisateur!');
          await message.channel.permissionOverwrites.edit(user, {
            ViewChannel: true,
            SendMessages: true,
            ReadMessageHistory: true,
          });
          const embed = new EmbedBuilder().setColor('#57F287').setTitle('➕ Ajouté').setDescription(`${user} a été ajouté`);
          return message.reply({ embeds: [embed] });
        }

        if (subcommand === 'remove') {
          if (!message.member.permissions.has('ManageMessages')) return message.reply('❌ Permission denied!');
          const user = message.mentions.users.first();
          if (!user) return message.reply('❌ Mention un utilisateur!');
          await message.channel.permissionOverwrites.edit(user, {
            ViewChannel: false,
            SendMessages: false,
            ReadMessageHistory: false,
          });
          const embed = new EmbedBuilder().setColor('#FEE75C').setTitle('➖ Retiré').setDescription(`${user} a été retiré`);
          return message.reply({ embeds: [embed] });
        }

        if (subcommand === 'list') {
          const tickets = message.guild.channels.cache.filter(ch => ch.name.includes('-') && (ch.name.includes('support-') || ch.name.includes('report-') || ch.name.includes('appeal-') || ch.name.includes('partnership-')));
          if (tickets.size === 0) return message.reply('❌ Pas de tickets!');
          const embed = new EmbedBuilder()
            .setColor('#00B0F4')
            .setTitle('📋 Tickets')
            .setDescription(`${tickets.size} ticket(s) ouvert(s)`)
            .addFields(...tickets.map(ch => ({ name: ch.name, value: `ID: ${ch.id}`, inline: false })));
          return message.reply({ embeds: [embed] });
        }
      }
    } catch (error) {
      console.error('Command error:', error);
      message.reply('❌ Erreur!').catch(() => {});
    }
  },
};
