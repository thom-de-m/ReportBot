# Config
When using this you **must create a config.json** in the **config directory**, just copy the **example_config.json** content and just fill in whatever you need!

# Values
| Key | Description |
| --- | --- |
| token | This is the token for your Discord bot. |
| channel_to_post_in | This is the channel in which the bot should post bug reports, make sure this is the channel ID and the bot can write to the channel. | 
| cancel_command | The command that will be checked against to cancel a bug report. |
| cancel_executed_message | The message which will be displayed when a user has cancelled a bug report. |
| max_attachments | The max attachments a user can upload for a report. |
| reply_timeout_in_seconds | The timeout in seconds after which the bot will shutdown the bug report. |
| report_cooldown_in_seconds | The timeout in seconds after which a user can report a new bug. |
| uploaded_attachment | The message which will be displayed when a user has submitted an attachment. |
| max_attachments_reached | The message which will be displayed when a user has reached the max amount of attachments for this report. |
| last_attachment_reached | The message which will be displayed when a user has reached the last attachment they can submit for this report. |
| attachments_message | The style for the message which will be displayed when an attachment is posted in the bug report. |
| goodbye_message | The message which will be displayed when a bug report has been finished. |
| timeout_message | The message which will be displayed when a user is taking too long to answer a question. |
| submitted_by_message | The style for the message which will be displayed when the user posted a bug report. |
| cooldown_message | The style for the message which will be displayed when the user is still on a cooldown. |
| welcome_message | The style for the message which will be displayed when the user sends a message to report a new bug. |
| error_message_sending_report | The error message when something goes wrong while creating the bug report, this most likely was caused by the user using too much text in their report. |
| questions | The information needed in order to display a question. |
| questions.question | The style for the message which will be displayed when the user is prompted a question. |
| questions.display | The style for the message which will be displayed when the bug reported is posted. |
| questions.answers_possible | The answers which are possible for this question, may be empty. |
| questions.wrong_possible_answer | The response when a user enters a wrong answer to a fixed question, can't be empty if a fixed question is required. |