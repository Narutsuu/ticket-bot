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
            { name: '!ticket setup', value: 'Configure et envoie le panel de tickets', inline: false },
            { name: '!ticket config', value: 'Modifie la configuration des tickets', inline: false },
            { name: '!ticket close', value: 'Ferme le ticket actuel', inline: false },
            { name: '!ticket add @user', value: 'Ajoute un utilisateur', inline: false },
            { name: '!ticket remove @user', value: 'Retire un utilisateur', inline: false },
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
            { name: 'Version', value: '2.0.0', inline: true },
            { name: 'Dev', value: 'Narutsuu', inline: true },
            { name: 'Serveurs', value: client.guilds.cache.size.toString(), inline: true }
          );
        return message.reply({ embeds: [embed] });
      }

      if (command === 'ticket') {
        const subcommand = args[0]?.toLowerCase();
        const config = require('../../config.json');
        const { EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');

        if (subcommand === 'setup') {
          if (!message.member.permissions.has('ManageMessages')) {
            return message.reply('❌ Permission refusée!');
          }

          const embed = new EmbedBuilder()
            .setColor(config.colors.primary)
            .setTitle('🎫 Système de Tickets')
            .setDescription('Sélectionnez la catégorie de votre ticket ci-dessous')
            .addFields(...config.categories.map(cat => ({
              name: `${cat.emoji} ${cat.label}`,
              value: `Crée un ticket ${cat.label.toLowerCase()}`,
              inline: true,
            })))
            .setFooter({ text: 'Utilisez le menu déroulant pour sélectionner une catégorie' });

          const selectMenu = new StringSelectMenuBuilder()
            .setCustomId('ticket_category_select')
            .setPlaceholder('Choisir une catégorie...')
            .addOptions(config.categories.map(cat => ({
              label: cat.label,
              value: cat.name,
              emoji: cat.emoji,
              description: `Créer un ticket ${cat.label.toLowerCase()}`
            })));

          const row = new ActionRowBuilder().addComponents(selectMenu);
          return message.reply({ embeds: [embed], components: [row] });
        }

        if (subcommand === 'config') {
          if (!message.member.permissions.has('Administrator')) {
            return message.reply('❌ Permission refusée! (Admin seulement)');
          }

          const embed = new EmbedBuilder()
            .setColor(config.colors.primary)
            .setTitle('⚙️ Configuration des Tickets')
            .addFields(
              { name: '📝 Catégories actuelles', value: config.categories.map(c => `${c.emoji} ${c.label}`).join('\n'), inline: false },
              { name: '🎨 Couleurs', value: `Principal: ${config.colors.primary}\nSuccès: ${config.colors.success}\nErreur: ${config.colors.error}`, inline: false },
              { name: '⏰ Limites', value: `Max tickets: ${config.limits.maxOpenTickets}\nTimeout: ${config.limits.ticketTimeout}ms`, inline: false }
            )
            .setFooter({ text: 'Sélectionnez ce que vous voulez modifier' });

          const configMenu = new StringSelectMenuBuilder()
            .setCustomId('config_select')
            .setPlaceholder('Que voulez-vous configurer?')
            .addOptions([
              { label: 'Ajouter une catégorie', value: 'add_category', emoji: '➕', description: 'Ajouter une nouvelle catégorie de ticket' },
              { label: 'Supprimer une catégorie', value: 'remove_category', emoji: '➖', description: 'Supprimer une catégorie existante' },
              { label: 'Modifier couleurs', value: 'modify_colors', emoji: '🎨', description: 'Personnaliser les couleurs des embeds' },
              { label: 'Modifier limites', value: 'modify_limits', emoji: '⏰', description: 'Modifier les limites de tickets' }
            ]);

          const row = new ActionRowBuilder().addComponents(configMenu);
          return message.reply({ embeds: [embed], components: [row] });
        }

        if (subcommand === 'close') {
          if (!message.member.permissions.has('ManageMessages')) {
            return message.reply('❌ Permission refusée!');
          }

          const embed = new EmbedBuilder()
            .setColor('#ED4245')
            .setTitle('🔒 Ticket Fermé')
            .addFields(
              { name: 'Par', value: message.author.tag, inline: true },
              { name: 'Date', value: new Date().toLocaleString('fr-FR'), inline: true }
            );

          message.reply({ embeds: [embed] });
          setTimeout(() => message.channel.delete().catch(() => {}), 3000);
        }

        if (subcommand === 'add') {
          if (!message.member.permissions.has('ManageMessages')) {
            return message.reply('❌ Permission refusée!');
          }

          const user = message.mentions.users.first();
          if (!user) return message.reply('❌ Mention un utilisateur!');

          await message.channel.permissionOverwrites.edit(user, {
            ViewChannel: true,
            SendMessages: true,
            ReadMessageHistory: true,
          });

          const embed = new EmbedBuilder()
            .setColor('#57F287')
            .setTitle('➕ Utilisateur Ajouté')
            .setDescription(`${user} a été ajouté au ticket`);

          return message.reply({ embeds: [embed] });
        }

        if (subcommand === 'remove') {
          if (!message.member.permissions.has('ManageMessages')) {
            return message.reply('❌ Permission refusée!');
          }

          const user = message.mentions.users.first();
          if (!user) return message.reply('❌ Mention un utilisateur!');

          await message.channel.permissionOverwrites.edit(user, {
            ViewChannel: false,
            SendMessages: false,
            ReadMessageHistory: false,
          });

          const embed = new EmbedBuilder()
            .setColor('#FEE75C')
            .setTitle('➖ Utilisateur Retiré')
            .setDescription(`${user} a été retiré du ticket`);

          return message.reply({ embeds: [embed] });
        }

        if (subcommand === 'list') {
          const tickets = message.guild.channels.cache.filter(ch => 
            ch.name.includes('-') && (ch.name.includes('support-') || ch.name.includes('report-') || ch.name.includes('appeal-') || ch.name.includes('partnership-'))
          );

          if (tickets.size === 0) return message.reply('❌ Pas de tickets!');

          const embed = new EmbedBuilder()
            .setColor('#00B0F4')
            .setTitle('📋 Tickets Ouverts')
            .setDescription(`${tickets.size} ticket(s)`)
            .addFields(...tickets.map(ch => ({ 
              name: ch.name, 
              value: `ID: ${ch.id}\nTopic: ${ch.topic || 'N/A'}`,
              inline: false 
            })));

          return message.reply({ embeds: [embed] });
        }
      }
    } catch (error) {
      console.error('Command error:', error);
      message.reply('❌ Erreur!').catch(() => {});
    }
  },
};
