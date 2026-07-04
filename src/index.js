const { Client, Collection, GatewayIntentBits, ActivityType } = require('discord.js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.MessageContent,
  ],
});

client.commands = new Collection();
client.buttons = new Collection();
client.modals = new Collection();
client.events = new Collection();

// Load commands
const commandsPath = path.join(__dirname, 'commands');
if (fs.existsSync(commandsPath)) {
  const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
  for (const file of commandFiles) {
    try {
      const filePath = path.join(commandsPath, file);
      const command = require(filePath);
      if (command.data && command.execute) {
        client.commands.set(command.data.name, command);
        console.log(`✅ Loaded command: ${command.data.name}`);
      }
    } catch (error) {
      console.error(`❌ Error loading command ${file}:`, error);
    }
  }
}

// Load button handlers
const buttonsPath = path.join(__dirname, 'buttons');
if (fs.existsSync(buttonsPath)) {
  const buttonFiles = fs.readdirSync(buttonsPath).filter(file => file.endsWith('.js'));
  for (const file of buttonFiles) {
    try {
      const filePath = path.join(buttonsPath, file);
      const button = require(filePath);
      if (button.customId) {
        client.buttons.set(button.customId, button);
        console.log(`✅ Loaded button: ${button.customId}`);
      }
    } catch (error) {
      console.error(`❌ Error loading button ${file}:`, error);
    }
  }
}

// Load modal handlers
const modalsPath = path.join(__dirname, 'modals');
if (fs.existsSync(modalsPath)) {
  const modalFiles = fs.readdirSync(modalsPath).filter(file => file.endsWith('.js'));
  for (const file of modalFiles) {
    try {
      const filePath = path.join(modalsPath, file);
      const modal = require(filePath);
      if (modal.customId) {
        client.modals.set(modal.customId, modal);
        console.log(`✅ Loaded modal: ${modal.customId}`);
      }
    } catch (error) {
      console.error(`❌ Error loading modal ${file}:`, error);
    }
  }
}

// Load events
const eventsPath = path.join(__dirname, 'events');
if (fs.existsSync(eventsPath)) {
  const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));
  for (const file of eventFiles) {
    try {
      const filePath = path.join(eventsPath, file);
      const event = require(filePath);
      if (event.name) {
        if (event.once) {
          client.once(event.name, (...args) => event.execute(...args, client));
        } else {
          client.on(event.name, (...args) => event.execute(...args, client));
        }
        console.log(`✅ Loaded event: ${event.name}`);
      }
    } catch (error) {
      console.error(`❌ Error loading event ${file}:`, error);
    }
  }
}

// Error handling
client.on('error', error => {
  console.error('❌ Bot error:', error);
});

process.on('unhandledRejection', error => {
  console.error('❌ Unhandled rejection:', error);
});

if (!process.env.DISCORD_TOKEN) {
  console.error('❌ ERROR: DISCORD_TOKEN not set in .env');
  process.exit(1);
}

console.log('🚀 Starting Ticket Bot...');
client.login(process.env.DISCORD_TOKEN);
