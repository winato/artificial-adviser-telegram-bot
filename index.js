require('dotenv').config();

const { Telegraf } = require('telegraf');
const { Configuration, OpenAIApi } = require('openai');
const configuration = new Configuration({
  apiKey: process.env.OPEN_AI_KEY
});
const texts = require('./texts');
const openai = new OpenAIApi(configuration);
const bot = new Telegraf(process.env.TG_KEY);

bot.start((ctx) => {
  ctx.sendChatAction('typing');
  ctx.telegram.sendMessage(ctx.chat.id, 
    texts.start(ctx),
    { parse_mode: "MarkdownV2" });
});

bot.help((ctx) => {
  ctx.sendChatAction('typing');
  ctx.telegram.sendMessage(ctx.chat.id, 
    texts.help,
    { parse_mode: "MarkdownV2" });
});

bot.command('example', (ctx) => {
  ctx.sendChatAction('typing');
  ctx.telegram.sendMessage(ctx.chat.id, 
    texts.example,
  { parse_mode: "MarkdownV2" });
});

bot.on('message', async (ctx) => {
    ctx.sendChatAction('typing');
    const data = await askOpenAI(ctx.message.text);

    if (data.choices && data.choices.length) {
      data.choices.forEach((item) => {
        ctx.reply(item.text);
      });
    } else {
      ctx.reply(data);
    }
});

bot.launch();

const askOpenAI = async (message) => {
  try {
    const { data } = await openai.createCompletion({
      model: "text-davinci-003",
      prompt: message,
      max_tokens: 256,
      top_p: 1,
      temperature: 0.9,
      frequency_penalty: 0.0,
      presence_penalty: 0.6,
      stream: false,
    });
  
    return data;
  } catch {
    return 'Sorry, I am broke :(';
  }
}

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
