const { EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
const fs = require('fs');
const path = require('path');

const configPath = path.join(__dirname, '../../ticketConfig.json');

function loadConfig() {
  if (fs.existsSync(configPath)) {
    return JSON.parse(fs.readFileSync(configPath, 'utf-8'));
  }
  return {
    categories: [
      { name: 'support', label: 'Support', emoji: '🆘' },
      { name: 'report', label: 'Signalement', emoji: '📋' },
      { name: 'appeal', label: 'Appel', emoji: '⚖️' },
      { name: 'partnership', label: 'Partenariat', emoji: '🤝' }
    ],
    colors: {
      primary: '#5865F2',
      success: '#57F287',
      error: '#ED4245',
      warning: '#FEE75C',
      info: '#00B0F4'
    },
    messages: {
      welcome: 'Bienvenue dans ce ticket de support!',
      maxTickets: 3,
      ticketPrefix: 'ticket'
    }
  };
}

function saveConfig(config) {
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
}

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
        const embed = new EmbedBuilder()
          .setColor('#5865F2')
          .setTitle('🎫 Ticket Bot - Commandes')
          .addFields(
            { name: '!help', value: 'Affiche cette aide', inline: false },
            { name: '!ping', value: 'Latence du bot', inline: false },
            { name: '!about', value: 'Info du bot', inline: false },
            { name: '!ticket setup', value: 'Envoie le panel de tickets', inline: false },
            { name: '!ticket config', value: 'Ouvre le menu de configuration complet', inline: false },
            { name: '!ticket close', value: 'Ferme le ticket actuel', inline: false },
            { name: '!ticket add @user', value: 'Ajoute un utilisateur', inline: false },
            { name: '!ticket remove @user', value: 'Retire un utilisateur', inline: false },
            { name: '!ticket list', value: 'Liste les tickets', inline: false }
          );
        return message.reply({ embeds: [embed] });
      }

      if (command === 'ping') {
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
        const embed = new EmbedBuilder()
          .setColor('#00B0F4')
          .setTitle('ℹ️ Ticket Bot')
          .addFields(
            { name: 'Version', value: '2.0.0 Pro', inline: true },
            { name: 'Dev', value: 'Narutsuu', inline: true },
            { name: 'Serveurs', value: client.guilds.cache.size.toString(), inline: true }
          );
        return message.reply({ embeds: [embed] });
      }

      if (command === 'ticket') {
        const subcommand = args[0]?.toLowerCase();
        const config = loadConfig();

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
            .setTitle('⚙️ Configuration Complète')
            .setDescription('Configurez tous les aspects du système de tickets')
            .addFields(
              { name: '📝 Catégories', value: `${config.categories.length} catégories configurées`, inline: true },
              { name: '🎨 Couleurs', value: 'Personnalisables', inline: true },
              { name: '💬 Messages', value: 'Modifiables', inline: true },
              { name: '⏰ Limites', value: `Max: ${config.messages.maxTickets} tickets`, inline: true }
            );

          const mainMenu = new StringSelectMenuBuilder()
            .setCustomId('main_config_select')
            .setPlaceholder('Que voulez-vous configurer?')
            .addOptions([
              { label: 'Gestion Catégories', value: 'manage_categories', emoji: '📝', description: 'Ajouter/Modifier/Supprimer des catégories' },
              { label: 'Personnaliser Couleurs', value: 'customize_colors', emoji: '🎨', description: 'Modifier les couleurs des embeds' },
              { label: 'Messages Personnalisés', value: 'customize_messages', emoji: '💬', description: 'Modifier les messages du bot' },
              { label: 'Limites & Préférences', value: 'limits_prefs', emoji: '⚙️', description: 'Configurer les limites et préférences' },
              { label: 'Aperçu Configuration', value: 'preview_config', emoji: '👁️', description: 'Voir la config actuelle' }
            ]);

          const row = new ActionRowBuilder().addComponents(mainMenu);
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
