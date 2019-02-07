const Discord = require('discord.js');
const client = new Discord.Client();
const config = require('./config/config.json');

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
  return;
}

function getFormattedReport(report, user) {
  let reportString = '';
  let attachments = '';
  for (let i = 0; i < config.questions.length; i++) {
	if (report.answers[i].attachments) {
	  report.answers[i].attachments.forEach(value => {
		attachments += '\n' + value.url;
	  });
	}
    reportString += config.questions[i].display + '\n' + report.answers[i].content + '\n\n';
  }
  
  if (attachments) {
	reportString += config.attachments_message + attachments + '\n\n';
  }
	
  reportString += config.submitted_by_message.replace('%USER%', '<@' + user + '>');
  
  return reportString;
}

function setTimer(message) {
  return setTimeout(() => {
	currentReports.delete(message.author.id);
	message.reply(config.timeout_message);
  }, config.reply_timeout_in_seconds * 1000);
}

function validateAnswer(report, message) {
  let json = config.questions[report.current_question - 1].answers_possible;
  if (!json) return true;
  
  for (let i = 0; i < json.length; i++) {
	if (message.content.toUpperCase() !== json[i].toUpperCase()) continue;
	return true;
  }
  
  let answer = config.questions[report.current_question - 1].wrong_possible_answer;
  for (let i = 0; i < json.length; i++) {
	answer += '\n' + json[i];
  }
  
  message.reply(answer);
  return false;
}

function saveAnswerAndRespondIfNeeded(report, message, newQuestion) {
  report.answers[report.current_question - 1] = message;
  clearTimeout(report.timeout);
  
  if (newQuestion) {
	message.reply(config.questions[report.current_question].question);
	report.timeout = setTimer(message);
  }
  
  report.current_question += 1;
  currentReports.set(message.author.id, report);
}

client.on('message', message => {
  if (message.channel.type != 'dm' || message.author.bot) return;
  if (usersOnCooldown.has(message.author.id)) {
	let time = (Date.now() - usersOnCooldown.get(message.author.id)).toString();
	let cooldown = '';
	
	for (let i = 0; i < time.length - 3; i++) {
		cooldown += time[i];
	}
	
	message.reply(config.cooldown_message.replace('%COOLDOWN%', config.report_cooldown_in_seconds - parseInt(cooldown)));
	return;
  }
  
  if (currentReports.has(message.author.id)) {
	let report = currentReports.get(message.author.id);
	
	if (report.current_question >= config.questions.length) {
	  saveAnswerAndRespondIfNeeded(report, message, false);
	  message.reply(config.goodbye_message.replace('%COOLDOWN%', config.report_cooldown_in_seconds));
	  
	  currentReports.delete(message.author.id);
	  
	  client.channels.get(config.channel_to_post_in).send(getFormattedReport(report, message.author.id));
	  usersOnCooldown.set(message.author.id, Date.now());
	} else {
	  if (validateAnswer(report, message)) {
		saveAnswerAndRespondIfNeeded(report, message, true);
	  }
	}
  } else {
    currentReports.set(message.author.id, {
	  current_question: 1,
	  answers: [config.questions.length],
	  timeout: setTimer(message)
	});
	  
	message.reply(config.welcome_message.replace('%TIMEOUT%', config.reply_timeout_in_seconds) + '\n\n' + config.questions[0].question);
  }
});

setInterval(() => {
  usersOnCooldown.forEach((value, key) => {
	if (Date.now() - value < config.report_cooldown_in_seconds * 1000) return;
	usersOnCooldown.delete(key);
  });
}, 5000);