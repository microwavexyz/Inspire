import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } from 'discord.js';
import schedule from 'node-schedule';

export default {
    data: new SlashCommandBuilder()
        .setName('announce')
        .setDescription('Create and schedule an announcement')
        .addStringOption(option =>
            option.setName('title')
                .setDescription('The title of the announcement')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('content')
                .setDescription('The content of the announcement')
                .setRequired(true))
        .addChannelOption(option =>
            option.setName('channel')
                .setDescription('The channel to send the announcement to')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('color')
                .setDescription('The color of the embed (hex code)')
                .setRequired(false))
        .addStringOption(option =>
            option.setName('schedule')
                .setDescription('Schedule the announcement (format: YYYY-MM-DD HH:mm)')
                .setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

    async execute(interaction) {
        const title = interaction.options.getString('title');
        const content = interaction.options.getString('content');
        const channel = interaction.options.getChannel('channel');
        const color = interaction.options.getString('color') || '#0099ff';
        const scheduleTime = interaction.options.getString('schedule');

        const embed = new EmbedBuilder()
            .setTitle(title)
            .setDescription(content)
            .setColor(color)
            .setTimestamp();

        const sendAnnouncement = async () => {
            try {
                await channel.send({ embeds: [embed] });
                await interaction.followUp({ content: 'Announcement sent successfully!', ephemeral: true });
            } catch (error) {
                console.error('Error sending announcement:', error);
                await interaction.followUp({ content: 'There was an error sending the announcement.', ephemeral: true });
            }
        };

        if (scheduleTime) {
            const scheduledTime = new Date(scheduleTime);
            if (isNaN(scheduledTime.getTime())) {
                return interaction.reply({ content: 'Invalid date format. Please use YYYY-MM-DD HH:mm', ephemeral: true });
            }

            schedule.scheduleJob(scheduledTime, sendAnnouncement);
            await interaction.reply({ content: `Announcement scheduled for ${scheduleTime}`, ephemeral: true });
        } else {
            await interaction.deferReply({ ephemeral: true });
            await sendAnnouncement();
        }
    },
};
