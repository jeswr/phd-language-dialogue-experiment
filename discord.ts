import { REST, Routes } from 'discord.js';
import 'dotenv/config';

const commands = [
  {
    name: 'ping',
    description: 'Replies with Pong!',
  },
];

async function main() {
    const CLIENT_ID = process.env.DISCORD_APPLICATION_ID;
    const TOKEN = process.env.DISCORD_APPLICATION_ID;

    if (typeof CLIENT_ID === 'undefined') {
        throw new Error('No Discord application ID provided');
    }

    if (typeof TOKEN === 'undefined') {
        throw new Error('No Discord bot token provided');
    }

    const rest = new REST({ version: '10' }).setToken(TOKEN);
    
    try {
        console.log('Started refreshing application (/) commands.');
    
        await rest.put(Routes.applicationCommands(CLIENT_ID), { body: commands });
    
        console.log('Successfully reloaded application (/) commands.');
    } catch (error) {
        console.error(error);
    }
}

main();
