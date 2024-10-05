import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import checkPermissions from '../../functions/checkPermissions.js';
import logTicketAction from '../../functions/logTicketAction.js';

const supportRoleId = process.env.SUPPORT_ROLE_ID || '1282106458443485294';

export default {
    data: new SlashCommandBuilder()
        .setName('add-member')
        .setDescription('Adds a member to the ticket.')
        .addUserOption(option => 
            option.setName('user')
            .setDescription('The member to add to the ticket.')
            .setRequired(true)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),
    
    async execute(interaction) {
        if (!await checkPermissions(interaction, supportRoleId)) {
            return interaction.reply({ content: 'You do not have permission to add members to this ticket.', ephemeral: true });
        }

        const user = interaction.options.getUser('user');
        const channel = interaction.channel;

        if (!channel.name.toLowerCase().startsWith('ticket-')) {
            return interaction.reply({ content: 'This command can only be used in ticket channels.', ephemeral: true });
        }

        await interaction.deferReply({ ephemeral: true });

        try {
            const permissionOverwrite = channel.permissionOverwrites.cache.get(user.id);
            if (permissionOverwrite?.allow.has(PermissionFlagsBits.ViewChannel)) {
                return interaction.editReply({ content: `${user.toString()} is already a member of this ticket.` });
            }

            await channel.permissionOverwrites.create(user, {
                ViewChannel: true,
                SendMessages: true,
                ReadMessageHistory: true,
                AttachFiles: true,
                EmbedLinks: true,
            });

            await logTicketAction(interaction.guild, `Member Added: ${user.tag}`, interaction.user, channel);

            await channel.send(`${user.toString()} has been added to the ticket by ${interaction.user.toString()}.`);
            await interaction.editReply({ content: `${user.toString()} has been successfully added to the ticket.` });

        } catch (error) {
            console.error('Error adding member to ticket:', error);
            await interaction.editReply({ content: 'An error occurred while adding the member to the ticket. Please try again or contact an administrator.' });
        }
    },
};
