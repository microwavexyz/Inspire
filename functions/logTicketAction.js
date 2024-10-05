// functions/logTicketAction.js

import { EmbedBuilder } from 'discord.js';

const LOG_CHANNEL_ID = '1285433668415782974'; // Replace with your log channel ID

const ACTION_COLORS = {
    'Closed': 0xFF0000,
    'Created': 0x00FF00,
    'Updated': 0xFFA500,
    'Default': 0x0000FF
};

export default async function logTicketAction(guild, action, user, channel) {
    const logChannel = guild.channels.cache.get(LOG_CHANNEL_ID);
    if (!logChannel) {
        console.error(`Log channel with ID ${LOG_CHANNEL_ID} not found in the guild.`);
        return;
    }

    const actionColor = getActionColor(action);
    const logEmbed = createLogEmbed(action, user, channel, actionColor);

    try {
        await logChannel.send({ embeds: [logEmbed] });
        console.log(`✅ Ticket action "${action}" logged successfully in ${logChannel.name}`);
    } catch (error) {
        console.error(`Failed to log ticket action: ${error.message}`);
    }
}

function getActionColor(action) {
    const actionType = action.split(' ')[0];
    return ACTION_COLORS[actionType] || ACTION_COLORS.Default;
}

function createLogEmbed(action, user, channel, color) {
    return new EmbedBuilder()
        .setTitle('🎫 Ticket System Log')
        .setDescription(`Ticket ${action.toLowerCase()}.`)
        .addFields(
            { name: 'Action', value: action, inline: true },
            { name: 'User', value: `${user.tag} (ID: ${user.id})`, inline: true },
            { name: 'Channel', value: `<#${channel.id}> (ID: ${channel.id})`, inline: true },
            { name: 'Ticket Created At', value: `<t:${Math.floor(channel.createdTimestamp / 1000)}:F>`, inline: false },
            { name: 'Action Timestamp', value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: false }
        )
        .setFooter({ text: `Ticket ID: ${channel.id}` })
        .setColor(color)
        .setTimestamp();
}
