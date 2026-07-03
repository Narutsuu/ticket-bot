const fs = require('fs');
const path = require('path');

const logsDir = path.join(__dirname, '../../logs');

// Créer le dossier logs s'il n'existe pas
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

const logger = {
  info: (message) => {
    const timestamp = new Date().toLocaleString('fr-FR');
    const logMessage = `[${timestamp}] INFO: ${message}\n`;
    console.log(`ℹ️  ${logMessage}`);
    fs.appendFileSync(path.join(logsDir, 'info.log'), logMessage);
  },

  error: (message, error) => {
    const timestamp = new Date().toLocaleString('fr-FR');
    const logMessage = `[${timestamp}] ERROR: ${message}\n${error ? error.stack : ''}\n`;
    console.error(`❌ ${logMessage}`);
    fs.appendFileSync(path.join(logsDir, 'error.log'), logMessage);
  },

  warn: (message) => {
    const timestamp = new Date().toLocaleString('fr-FR');
    const logMessage = `[${timestamp}] WARN: ${message}\n`;
    console.warn(`⚠️  ${logMessage}`);
    fs.appendFileSync(path.join(logsDir, 'warn.log'), logMessage);
  },

  ticket: (message) => {
    const timestamp = new Date().toLocaleString('fr-FR');
    const logMessage = `[${timestamp}] TICKET: ${message}\n`;
    console.log(`🎫 ${logMessage}`);
    fs.appendFileSync(path.join(logsDir, 'tickets.log'), logMessage);
  },
};

module.exports = logger;
