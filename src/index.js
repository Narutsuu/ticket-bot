const { Client, Collection, GatewayIntentBits, ActivityType, REST, Routes } = require('discord.js');
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
client.prefixCommands = new Collection();
client.buttons = new Collection();
client.modals = new Collection();
client.events = new Collection();

// Load slash commands
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
const commands = [];

for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  const command = require(filePath);
  if (command.data && command.execute) {
    client.commands.set(command.data.name, command);
    commands.push(command.data.toJSON());
  }
}

// Load button handlers
const buttonsPath = path.join(__dirname, 'buttons');
if (fs.existsSync(buttonsPath)) {
  const buttonFiles = fs.readdirSync(buttonsPath).filter(file => file.endsWith('.js'));
  for (const file of buttonFiles) {
    const filePath = path.join(buttonsPath, file);
    const button = require(filePath);
    if (button.customId) {
      client.buttons.set(button.customId, button);
    }
  }
}

// Load modal handlers
const modalsPath = path.join(__dirname, 'modals');
if (fs.existsSync(modalsPath)) {
  const modalFiles = fs.readdirSync(modalsPath).filter(file => file.endsWith('.js'));
  for (const file of modalFiles) {
    const filePath = path.join(modalsPath, file);
    const modal = require(filePath);
    if (modal.customId) {
      client.modals.set(modal.customId, modal);
    }
  }
}

// Load events
const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
  const filePath = path.join(eventsPath, file);
  const event = require(filePath);
  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args, client));
  } else {
    client.on(event.name, (...args) => event.execute(...args, client));
  }
}

// Register slash commands globally
async function registerSlashCommands() {
  try {
    const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);
    
    console.log('📋 Registering slash commands globally...');
    
    const data = await rest.put(
      Routes.applicationCommands(client.user.id),
      { body: commands }
    );
    
    console.log(`✅ Successfully registered ${data.length} slash commands globally`);
  } catch (error) {
    console.error('❌ Error registering slash commands:', error);
  }
}

// Error handling
client.on('error', error => {
  console.error('❌ Bot error:', error);
});

process.on('unhandledRejection', error => {
  console.error('❌ Unhandled promise rejection:', error);
});

// Check for required environment variables
if (!process.env.DISCORD_TOKEN) {
  console.error('❌ ERROR: DISCORD_TOKEN is not set in .env file');
  process.exit(1);
}

console.log('🚀 Starting Ticket Bot...');
client.once('ready', () => {
  registerSlashCommands();
});

client.login(process.env.DISCORD_TOKEN).catch(error => {
  console.error('❌ Failed to login:', error.message);
  process.exit(1);
});
