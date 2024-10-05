import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { saveTranscript } from '../../functions/saveTranscript.js';
import logTicketAction from '../../functions/logTicketAction.js';
import checkPermissions from '../../functions/checkPermissions.js';

const supportRoleId = process.env.SUPPORT_ROLE_ID || '1292210184055427114';
const LOG_CHANNEL_ID = '1285433668415782974'; // Ensure this matches the ID in logTicketAction.js

export default {
    data: new SlashCommandBuilder()
        .setName('delete-ticket')
        .setDescription('Deletes the ticket and saves a transcript.')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),
    
    async execute(interaction) {
        if (!await checkPermissions(interaction, supportRoleId)) {
            return interaction.reply({ content: 'You do not have permission to delete this ticket.', ephemeral: true });
        }

        const channel = interaction.channel;
        const logChannel = interaction.guild.channels.cache.get(LOG_CHANNEL_ID);

        if (!channel.name.toLowerCase().startsWith('ticket-')) {
            return interaction.reply({ content: 'This command can only be used in ticket channels.', ephemeral: true });
        }

        if (!logChannel) {
            return interaction.reply({ content: 'Log channel not found.', ephemeral: true });
        }

        await interaction.deferReply({ ephemeral: true });

        try {
            // Save the transcript and send it to the log channel
            await saveTranscript(channel, logChannel);

            await interaction.editReply('Transcript saved successfully. Deleting the ticket in 5 seconds...');

            // Log the ticket action
            await logTicketAction(interaction.guild, 'Ticket Deleted', interaction.user, channel);

            setTimeout(async () => {
                try {
                    await channel.delete();
                } catch (error) {
                    console.error('Error deleting channel:', error);
                    await interaction.followUp({ content: 'Failed to delete the ticket channel.', ephemeral: true });
                }
            }, 5000);
        } catch (error) {
            console.error('Error during ticket deletion process:', error);
            await interaction.editReply({ content: 'An error occurred while deleting the ticket.', ephemeral: true });
        }
    },
};
