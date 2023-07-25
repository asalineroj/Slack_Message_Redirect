const { App } = require('@slack/bolt');
// Require the Node Slack SDK package (github.com/slackapi/node-slack-sdk)
const { WebClient, LogLevel } = require("@slack/web-api");

//Escalation Channel 
const SLACK_ESCALATION_CHANNEL = process.env.SLACK_ESCALATION_CHANNEL;

//Timer duration default 120000 ms
const SLEEP_TIMER = process.env.SLEEP_TIMER || 120000;

// Initializes your app with your bot token and signing secret
const app = new App({
  token: process.env.SLACK_BOT_TOKEN, //Token for Posting Web API
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  socketMode: true, //Using socket for dev/local environment instead of HTTP
  appToken: process.env.SLACK_APP_TOKEN, //App Token to receive Events API
  // Socket Mode doesn't listen on a port, but in case you want your app to respond to OAuth,
  // you still need to listen on some port!
  port: process.env.PORT || 3000,
  ignoreSelf: false
});

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

// Home tab setup
// Home view
const homeView = 
{
   "type":"home",
   "blocks":[
      {
         "type":"section",
         "text":{
            "type":"mrkdwn",
            "text":"A simple stack of blocks for the simple sample Block Kit Home tab."
         }
      },
      {
         "type":"actions",
         "elements":[
            {
               "type":"button",
               "text":{
                  "type":"plain_text",
                  "text":"Action A",
                  "emoji":true
               },
               "action_id": "action_a"
            },
            {
               "type":"button",
               "text":{
                  "type":"plain_text",
                  "text":"Action B",
                  "emoji":true
               },
               "action_id": "action_b"
            }
         ]
      }
   ]
}

app.action('action_a', async ({ body, ack, client }) => {
  // Acknowledge the action
  //console.log(body)
  await ack();
  const result = await client.chat.postMessage({
    "channel": body.user.id,
    "text": `Hello <@${body.user.id}>! :wave: You triggered Action A! :clap:`
  });
  
});

app.action('action_b', async ({ body, ack, client }) => {
  // Acknowledge the action
  await ack();
  const result = await client.chat.postMessage({
    "channel": body.user.id,
    "text": `Hello <@${body.user.id}>! :wave: You triggered Action B! :clap:`
  });
});

// Home app
app.event('app_home_opened', async ({ event, context, client }) => {
  try {
    /* view.publish is the method that your app uses to push a view to the Home tab */
    
    const result = await client.views.publish({
        /* the user that opened your app's app home */
        user_id: event.user,
        /* the view object that appears in the app home*/
        view: homeView
    });
  }
  catch (error) {
    console.error(error);
  }
});

// Listens to incoming messages that contain "hello"
// Capture High Priority Messages
app.message(/\b(high|High)\b/, async ({ message, context, say }) => {
  // say() sends a message to the channel where the event was triggered
  console.log('received a Priority Swarm Case message');
  console.log('*******************');
  console.log('*******************');
  console.log('***RegEx Message**');

  console.log('***CONTEXT**');
  console.log(context);
  console.log('***MESSAGE**');
  console.log(message);

  console.log('***SLACK_ESCALATION_CHANNEL**');
  console.log(SLACK_ESCALATION_CHANNEL);
  
  if(message.channel!==SLACK_ESCALATION_CHANNEL) {
    try {
      
      // Define the Reaction and add it to channel
      let reaction = {
        "channel": message.channel,
        "name": "hourglass",
        "timestamp": message.ts
      };

      //timer before resending the message
      const postMessageBotToken = await app.client.chat.postMessage({
        channel: SLACK_ESCALATION_CHANNEL,
        text: ':warning: '+message.text
      });

    }
    catch (error) {
      console.log(error.data.scopes);
      console.log(error.acceptedScopes);
      console.error(error);
    }
  }
});

(async () => {
  // Start your app
  await app.start();
  console.log('***SLACK_ESCALATION_CHANNEL**');
  console.log(SLACK_ESCALATION_CHANNEL);
  console.log('⚡️ Bolt app is running!');
})();