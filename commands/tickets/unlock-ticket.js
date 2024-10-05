import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import checkPermissions from '../../functions/checkPermissions.js';
import logTicketAction from '../../functions/logTicketAction.js';

const supportRoleId = process.env.SUPPORT_ROLE_ID || '1282106458443485294';

export default {
    data: new SlashCommandBuilder()
        .setName('unlock-ticket')
        .setDescription('Unlocks the ticket so the user can respond.')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),

    async execute(interaction) {
        if (!await checkPermissions(interaction, supportRoleId)) {
            return interaction.reply({ content: 'You do not have permission to unlock this ticket.', ephemeral: true });
        }

        const channel = interaction.channel;

        if (!channel.name.toLowerCase().startsWith('ticket-')) {
            return interaction.reply({ content: 'This command can only be used in ticket channels.', ephemeral: true });
        }

        await interaction.deferReply({ ephemeral: true });

        try {
            const currentPermissions = channel.permissionOverwrites.cache.get(interaction.guild.roles.everyone.id);
            if (currentPermissions && currentPermissions.allow.has('SendMessages')) {
                return interaction.editReply('This ticket is already unlocked.');
            }

            await channel.permissionOverwrites.edit(interaction.guild.roles.everyone, {
                SendMessages: true
            });

            await logTicketAction(interaction.guild, 'Ticket Unlocked', interaction.user, channel);

            await channel.send(`🔓 This ticket has been unlocked by ${interaction.user.toString()}. The user can now respond.`);
            await interaction.editReply('This ticket has been successfully unlocked.');

        } catch (error) {
            console.error('Error unlocking the ticket:', error);
            await interaction.editReply('An error occurred while unlocking the ticket. Please try again or contact an administrator.');
        }
    },
};
