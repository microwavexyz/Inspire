import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import checkPermissions from '../../functions/checkPermissions.js';
import logTicketAction from '../../functions/logTicketAction.js';

const supportRoleId = process.env.SUPPORT_ROLE_ID || '1282106458443485294';

export default {
    data: new SlashCommandBuilder()
        .setName('lock-ticket')
        .setDescription('Locks the ticket so only support staff can reply.')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),

    async execute(interaction) {
        if (!await checkPermissions(interaction, supportRoleId)) {
            return interaction.reply({ content: 'You do not have permission to lock this ticket.', ephemeral: true });
        }

        const channel = interaction.channel;

        if (!channel.name.toLowerCase().startsWith('ticket-')) {
            return interaction.reply({ content: 'This command can only be used in ticket channels.', ephemeral: true });
        }

        await interaction.deferReply({ ephemeral: true });

        try {
            await channel.permissionOverwrites.edit(interaction.guild.roles.everyone, {
                SendMessages: false
            });

            await logTicketAction(interaction.guild, 'Ticket Locked', interaction.user, channel);

            await channel.send(`🔒 This ticket has been locked by ${interaction.user.toString()}. Only support staff can reply now.`);
            await interaction.editReply('This ticket has been successfully locked.');

        } catch (error) {
            console.error('Error locking the ticket:', error);
            await interaction.editReply('An error occurred while locking the ticket. Please try again or contact an administrator.');
        }
    },
};
