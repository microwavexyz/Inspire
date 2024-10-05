import { SlashCommandBuilder } from 'discord.js';
import logTicketAction from '../../functions/logTicketAction.js';
import checkPermissions from '../../functions/checkPermissions.js';
import { saveTranscript } from '../../functions/saveTranscript.js';

const supportRoleId = '1282106458443485294'; // Replace with your support role ID

export default {
    data: new SlashCommandBuilder()
        .setName('close-ticket')
        .setDescription('Closes the current ticket and saves a transcript.'),

    async execute(interaction) {
        try {
            // Permission check
            if (!await checkPermissions(interaction, supportRoleId)) {
                return interaction.reply({ content: 'You do not have permission to use this command.', ephemeral: true });
            }

            const channel = interaction.channel;

            // Ensure the command is used in a ticket channel
            if (!channel.name.startsWith('ticket-')) {
                return interaction.reply({ content: 'This command can only be used in ticket channels.', ephemeral: true });
            }

            // Inform the user that the transcript is being saved
            await interaction.reply('Saving the transcript... Please wait.');

            // Save the transcript
            const { transcriptEmbed, attachment } = await saveTranscript(channel);

            // Check if the transcript was saved successfully
            if (transcriptEmbed && attachment) {
                // Send the transcript to the channel
                await channel.send({ embeds: [transcriptEmbed], files: [attachment] });
                await interaction.editReply('Transcript saved successfully. Closing the ticket in 5 seconds...');
            } else {
                throw new Error('Transcript could not be saved.');
            }

            // Log the ticket closing action
            await logTicketAction(interaction.guild, 'Ticket Closed', interaction.user, channel);

            // Delay for 5 seconds before deleting the channel
            setTimeout(async () => {
                try {
                    await channel.delete();
                } catch (error) {
                    console.error('Error deleting channel:', error);
                    await interaction.followUp({ content: 'Failed to delete the ticket channel.', ephemeral: true });
                }
            }, 5000);

        } catch (error) {
            console.error('Error during ticket closing process:', error);
            
            // Handle error and ensure proper interaction response
            if (!interaction.replied && !interaction.deferred) {
                return interaction.reply({ content: 'An error occurred while closing the ticket.', ephemeral: true });
            } else {
                return interaction.followUp({ content: 'An error occurred while closing the ticket.', ephemeral: true });
            }
        }
    },
};
