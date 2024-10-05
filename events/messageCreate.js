import { Events } from 'discord.js';

export default {
    name: Events.MessageCreate,
    async execute(message) {
        const restrictedChannels = process.env.RESTRICTED_CHANNELS?.split(',') || ['1282107324479311975'];

        if (restrictedChannels.includes(message.channel.id) && !message.author.bot) {
            try {
                await message.delete();
                console.log(`Deleted message from ${message.author.tag} in channel ${message.channel.id}`);

                // Optionally, send a temporary warning message
                const warningMessage = await message.channel.send(`${message.author}, messages are not allowed in this channel.`);
                setTimeout(() => warningMessage.delete().catch(console.error), 5000); // Delete after 5 seconds
            } catch (error) {
                console.error('Failed to handle restricted message:', error);
            }
        }
    },
};
