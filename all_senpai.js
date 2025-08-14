const fs = require('fs');
const path = require('path');
require('dotenv').config();
const { Client, GatewayIntentBits, Collection } = require('discord.js');

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent]
});
client.commands = new Collection();

const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  const command = require(filePath);
  if ('data' in command && 'execute' in command) {
    client.commands.set(command.data.name, command);
  }
}

const { REST, Routes } = require('discord.js');
const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

(async () => {
  const commands = client.commands.map(cmd => cmd.data.toJSON());
  try {
    await rest.put(
      Routes.applicationGuildCommands('1377513527623024750', '1314530064796225536'),
      { body: commands },
    );
    console.log('スラッシュコマンドを登録しました。');
  } catch (error) {
    console.error(error);
  }
})();

client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;
  const command = client.commands.get(interaction.commandName);
  if (!command) return;

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(error);
    await interaction.reply({ content: 'コマンド実行中にエラーが発生しました。', ephemeral: true });
  }
});

client.once('ready', () => {
    console.log(`${client.user.tag}としてログインしました。`);
});

client.login(process.env.DISCORD_BOT_TOKEN);