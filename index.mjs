import { promises as fs } from 'fs';
import path from 'path';
import { Client, GatewayIntentBits, Collection } from 'discord.js';
import dotenv from 'dotenv';
import { fileURLToPath, pathToFileURL } from 'url';
import { saveTranscript } from './functions/saveTranscript.js';

dotenv.config();

// Convert import.meta.url to a file path
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildModeration,
        GatewayIntentBits.GuildEmojisAndStickers,
        GatewayIntentBits.GuildIntegrations,
        GatewayIntentBits.GuildWebhooks,
        GatewayIntentBits.GuildInvites,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildPresences,
    ],
});

client.commands = new Collection();

async function loadCommands() {
    const foldersPath = path.join(__dirname, 'commands');
    const commandFolders = await fs.readdir(foldersPath);

    for (const folder of commandFolders) {
        const commandsPath = path.join(foldersPath, folder);
        const commandFiles = await fs.readdir(commandsPath);
        for (const file of commandFiles) {
            if (file.endsWith('.js')) {
                const filePath = pathToFileURL(path.join(commandsPath, file)).href;
                try {
                    const { default: command } = await import(filePath);
                    if ('data' in command && 'execute' in command) {
                        client.commands.set(command.data.name, command);
                        console.log(`Loaded command: ${command.data.name}`);
                    } else {
                        console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
                    }
                } catch (error) {
                    console.error(`[ERROR] Failed to load command at ${filePath}:`, error);
                }
            }
        }
    }
}

async function loadEvents() {
    const eventsPath = path.join(__dirname, 'events');
    const eventFiles = (await fs.readdir(eventsPath)).filter(file => file.endsWith('.js'));

    for (const file of eventFiles) {
        const filePath = pathToFileURL(path.join(eventsPath, file)).href;
        try {
            const { default: event } = await import(filePath);
            if (event.once) {
                client.once(event.name, (...args) => event.execute(...args, client));
            } else {
                client.on(event.name, (...args) => event.execute(...args, client));
            }
            console.log(`Loaded event: ${event.name}`);
        } catch (error) {
            console.error(`[ERROR] Failed to load event at ${filePath}:`, error);
        }
    }
}

async function initializeBot() {
    try {
        await loadCommands();
        await loadEvents();
        await client.login(process.env.TOKEN);
        console.log('Bot initialized successfully');
    } catch (error) {
        console.error('Error initializing bot:', error);
        process.exit(1);
    }
}

initializeBot();

// Error handling for unhandled promises
process.on('unhandledRejection', (error) => {
    console.error('Unhandled promise rejection:', error);
});
