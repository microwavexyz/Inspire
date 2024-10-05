import { REST, Routes } from 'discord.js';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import dotenv from 'dotenv';

dotenv.config(); // Load environment variables

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const commands = [];
const commandFolders = await fs.readdir(path.join(__dirname, './commands'));

for (const folder of commandFolders) {
    const folderPath = path.join(__dirname, './commands', folder);
    const commandFiles = (await fs.readdir(folderPath)).filter(file => file.endsWith('.js'));
    
    for (const file of commandFiles) {
        const commandPath = path.join(folderPath, file);
        const commandModule = await import(pathToFileURL(commandPath).href);
        const command = commandModule.default;
    
        if (command && 'data' in command && 'toJSON' in command.data) {
            commands.push(command.data.toJSON());
        } else {
            console.log(`Skipping command file: ${file}, missing required 'data' or 'toJSON' method.`);
        }
    }
}

const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

(async () => {
    try {
        console.log('Started refreshing application (/) commands.');

        await rest.put(
            Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
            { body: commands },
        );

        console.log('Successfully reloaded guild application (/) commands.');
    } catch (error) {
        console.error(error);
    }
})();
