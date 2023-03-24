
require('dotenv').config();

const { Telegraf } = require('telegraf');
const { Configuration, OpenAIApi } = require('openai');
const bot = new Telegraf(process.env.TG_KEY);
const configuration = new Configuration({
  apiKey: process.env.OPEN_AI_KEY
});

const openai = new OpenAIApi(configuration);


bot.start((ctx) => {
  ctx.telegram.sendMessage(ctx.chat.id, 
`Hello, ${ctx.from.first_name}\\! This bot allows you to use ChatGPT quickly and conveniently, without having to open an inconvenient site every time\\.
    
ChatGPT is an artificial intelligence model from OpenAI that can answer questions and perform various tasks through a chat interface\\. It is trained on an extremely large amount of textual information and has a good understanding of the meaning of words\\.
    
ChatGPT works best with English, but also supports other languages\\. You don't need to configure anything, just write your queries in the language you want\\.

*We don't store the history of your messages with the bot*\\. Because of this, the model does not remember your previous requests and generates each response from scratch\\. To get the best result, write your requests in as much detail as possible and don't be afraid to experiment\\.

Try it yourself now\\! Just write any request in the chat, and artificial intelligence will generate an answer for you\\!

You can also use the /example command to see examples\\.\\.\\.

_P\\.S\\. My avatar generated with AI as well\\!_`,
    { parse_mode: "MarkdownV2" });
});

bot.command('example', (ctx) => {
  ctx.telegram.sendMessage(ctx.chat.id, 
`*Here are some examples of using ChatGPT\\:*
  
Create a one month workout plan for me exercise my shoulder muscles\\.
  
What was the population of the Netherlands in 1900\\?

Write the 10 most interesting facts from Churchill's biography\\.

What are the most common problems faced by people learning programming\\?

Write a letter of resignation to my employer\\. The reason for my resignation is that I need a more flexible schedule due to family issues\\.
`,
  { parse_mode: "MarkdownV2" });
});

bot.on('message', async (ctx) => {
  try {
    ctx.sendChatAction('typing');
    
    const { data } = await openai.createCompletion({
      model: "text-davinci-003",
      prompt: ctx.message.text,
      max_tokens: 256,
      top_p: 1,
      temperature: 0.9,
      frequency_penalty: 0.0,
      presence_penalty: 0.6,
      stream: false,
    });
    
    data.choices.forEach((item) => {
      ctx.reply(item.text);
    });

  } catch {
    ctx.reply('Sorry, I am broke :(');
  }
});

bot.launch();

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
