import { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import checkPermissions from '../../functions/checkPermissions.js';

const supportRoleId = process.env.SUPPORT_ROLE_ID || '1282106458443485294';

export default {
    data: new SlashCommandBuilder()
        .setName('ticket-dashboard')
        .setDescription('Shows a dashboard of all active tickets.'),

    async execute(interaction) {
        if (!checkPermissions(interaction, supportRoleId)) {
            return interaction.reply({ content: 'You do not have permission to view the ticket dashboard.', ephemeral: true });
        }

        await interaction.deferReply({ ephemeral: true });

        const tickets = interaction.guild.channels.cache.filter(c => c.name.toLowerCase().startsWith('ticket-'));

        if (!tickets.size) {
            return interaction.editReply('No active tickets found.');
        }

        const embed = new EmbedBuilder()
            .setTitle('Active Ticket Dashboard')
            .setDescription(`There are currently ${tickets.size} active tickets.`)
            .setColor(0x00BFFF)
            .setTimestamp();

        const ticketList = tickets.map(ticket => {
            const createdAt = ticket.createdAt.toLocaleString();
            return `<#${ticket.id}> - Created: ${createdAt}`;
        }).join('\n');

        if (ticketList.length <= 4096) {
            embed.addFields({ name: 'Active Tickets', value: ticketList });
        } else {
            embed.setDescription(`${tickets.size} active tickets found. Too many to display in detail.`);
            const truncatedList = ticketList.slice(0, 4000) + '...\n(Truncated due to length)';
            embed.addFields({ name: 'Recent Tickets', value: truncatedList });
        }

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('refresh_dashboard')
                    .setLabel('Refresh')
                    .setStyle(ButtonStyle.Primary),
            );

        await interaction.editReply({ embeds: [embed], components: [row] });
    },
};
