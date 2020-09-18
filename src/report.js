function formattedReport(report, user, config) {
  let reportString = '';
  let attachments = '';
  for (let i = 0; i < config.questions.length; i++) {
    reportString += config.questions[i].display + '\n' + report.answers[i] + '\n\n';
  }
  
  for (let i = 0; i < report.attachments_used; i++) {
	  attachments += '\n' + report.attachments[i];
  }
  
  if (attachments) {
	  reportString += config.attachments_message + attachments + '\n\n';
  }
	
  reportString = reportString.split('@').join('');
  reportString += config.submitted_by_message.replace('%USER%', '<@' + user + '>');
  
  return reportString;
}

function handleMessageException(promise) {
  promise.catch(error => {/*Do nothing*/});
}

function validateAnswer(report, message, config) {
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
  
  handleMessageException(message.reply(answer));
  return false;
}
  
function setTimer(message, currentReports, config) {
  return setTimeout(() => {
	  currentReports.delete(message.author.id);
	  handleMessageException(message.reply(config.timeout_message));
  }, config.reply_timeout_in_seconds * 1000);
}

function saveAnswerAndRespondIfNeeded(report, message, newQuestion, config, currentReports) {
  report.answers[report.current_question - 1] = message.content;
  clearTimeout(report.timeout);
  
  if (newQuestion) {
	  handleMessageException(message.reply(config.questions[report.current_question].question));
	  report.timeout = setTimer(message, currentReports, config);
  }
  
  report.current_question += 1;
  currentReports.set(message.author.id, report);
}

function handleAttachmentMessage(report, message, config) {
  if (message.attachments.size > 0) {
	  for (let attachment of message.attachments.values()) {
		  if (report.attachments_used !== config.max_attachments) {
        report.attachments[report.attachments_used] = attachment.url;
			  report.attachments_used += 1;
			  if (report.attachments_used === config.max_attachments) {
          handleMessageException(message.reply(config.last_attachment_reached));
			    return false;
			  } else {
			    handleMessageException(message.reply(config.uploaded_attachment.replace('%ATTACHMENTS_LEFT%', config.max_attachments - report.attachments_used)));	
			  }
		  } else {
			  handleMessageException(message.reply(config.max_attachments_reached));
			  return false;
		  }
	  }
	  
	  return false;
  }
  
  return true;
}

function validQuestion(report, message, config) {
  return handleAttachmentMessage(report, message, config) && validateAnswer(report, message, config);
}

module.exports.handleCooldown = function(userTime, message, config) {
  let time = (Date.now() - userTime).toString();
  let cooldown = '';
	
  for (let i = 0; i < time.length - 3; i++) {
    cooldown += time[i];
  }
	
  handleMessageException(message.reply(config.cooldown_message.replace('%COOLDOWN%', config.report_cooldown_in_seconds - parseInt(cooldown))));
}

module.exports.handleCancel = function(config, message, currentReports) {
  handleMessageException(message.reply(config.cancel_executed_message));
  currentReports.delete(message.author.id);
}

module.exports.handlePostReport = function(currentReports, usersOnCooldown, message, config, client) {
  let report = currentReports.get(message.author.id);
	
  if (report.current_question >= config.questions.length) {
    if (validQuestion(report, message, config)) {
      saveAnswerAndRespondIfNeeded(report, message, false, config, currentReports);
      handleMessageException(message.reply(config.goodbye_message.replace('%COOLDOWN%', config.report_cooldown_in_seconds)));
	  
	    currentReports.delete(message.author.id);
	  
	    client.channels.cache.get(config.channel_to_post_in).send(formattedReport(report, message.author.id, config)).catch(() => {
        handleMessageException(message.reply(config.error_message_sending_report));
      });
      usersOnCooldown.set(message.author.id, Date.now());
    }
  } else if (validQuestion(report, message, config)) {
	  saveAnswerAndRespondIfNeeded(report, message, true, config, currentReports);
  }
}

module.exports.handleFirstBotReply = function(currentReports, message, config) {
  currentReports.set(message.author.id, {
	  current_question: 1,
	  answers: [config.questions.length],
	  timeout: setTimer(message, currentReports, config),
	  attachments_used: 0,
	  attachments: [config.max_attachments]
  });
	  
  handleMessageException(message.reply(config.welcome_message.replace('%TIMEOUT%', config.reply_timeout_in_seconds).replace('%CANCEL_COMMAND%', config.cancel_command) + '\n\n' + config.questions[0].question));
}