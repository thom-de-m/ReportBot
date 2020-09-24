const Discord = require('discord.js');
const client = new Discord.Client();
const config = require('./config/config.json');
const report = require('./src/report.js');

const currentReports = new Map();
const usersOnCooldown = new Map();

client.login(config.token).then(() => {
  console.log('Successfully connected to Discord!');
}).catch(error => {
  console.error(error);
  console.log('Shutting down process since unable to connect to Discord!');
  process.exit(1);
});

if (config.questions.length === 0) {
  console.log("Questions can't be empty!");
  process.exit(1);
}

client.on('message', message => {
  if (message.channel.type != 'dm' || message.author.bot) return;
  if (usersOnCooldown.has(message.author.id)) {
	  let value = usersOnCooldown.get(message.author.id);
	  if (Date.now() - value >= config.report_cooldown_in_seconds * 1000) {
	    usersOnCooldown.delete(message.author.id);
	  } else {
	    report.handleCooldown(value, message, config);
	    return;
	  }
  }
  
  if (currentReports.has(message.author.id)) {
    // Back out if the user cancelled the report!
    if (message.content.toLowerCase() === config.cancel_command.toLowerCase()) {
      report.handleCancel(config, message, currentReports, usersOnCooldown);
      return;
    }

    // Handle the report answer.
    report.handlePostReport(currentReports, usersOnCooldown, message, config, client);
  } 
  else report.handleFirstBotReply(currentReports, message, config);
});

setInterval(() => {
  usersOnCooldown.forEach((value, key) => {
	  if (Date.now() - value < config.report_cooldown_in_seconds * 1000) return;
	  usersOnCooldown.delete(key);
  });
}, 5000);