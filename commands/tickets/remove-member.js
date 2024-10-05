import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import checkPermissions from '../../functions/checkPermissions.js';
import logTicketAction from '../../functions/logTicketAction.js';

const supportRoleId = process.env.SUPPORT_ROLE_ID || '1282106458443485294';

export default {
    data: new SlashCommandBuilder()
        .setName('remove-member')
        .setDescription('Removes a member from the ticket.')
        .addUserOption(option => 
            option.setName('user')
            .setDescription('The member to remove from the ticket.')
            .setRequired(true)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),

    async execute(interaction) {
        if (!checkPermissions(interaction, supportRoleId)) {
            return interaction.reply({ content: 'You do not have permission to remove members from this ticket.', ephemeral: true });
        }

        const user = interaction.options.getUser('user');
        const channel = interaction.channel;

        if (!channel.name.toLowerCase().startsWith('ticket-')) {
            return interaction.reply({ content: 'This command can only be used in ticket channels.', ephemeral: true });
        }

        await interaction.deferReply({ ephemeral: true });

        try {
            const permissionOverwrite = channel.permissionOverwrites.cache.get(user.id);
            if (!permissionOverwrite) {
                return interaction.editReply({ content: `${user.toString()} is not part of this ticket.` });
            }

            await channel.permissionOverwrites.delete(user.id);

            await logTicketAction(interaction.guild, `Member Removed: ${user.tag}`, interaction.user, channel);

            await channel.send(`${user.toString()} has been removed from the ticket by ${interaction.user.toString()}.`);
            await interaction.editReply({ content: `${user.toString()} has been successfully removed from the ticket.` });

        } catch (error) {
            console.error('Error removing member from ticket:', error);
            await interaction.editReply({ content: 'An error occurred while removing the member from the ticket. Please try again or contact an administrator.' });
        }
    },
};
