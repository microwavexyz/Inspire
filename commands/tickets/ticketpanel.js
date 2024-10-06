import { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, PermissionFlagsBits, ChannelType } from 'discord.js';
import checkPermissions from '../../functions/checkPermissions.js';

const supportRoleId = process.env.SUPPORT_ROLE_ID || '1282106458443485294';

export default {
    data: new SlashCommandBuilder()
        .setName('ticket-panel')
        .setDescription('Creates a ticket panel.')
        .addChannelOption(option =>
            option.setName('channel')
                .setDescription('The channel where the ticket panel will be sent.')
                .setRequired(true)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),

    async execute(interaction) {
        try {
            // Check if the interaction has already been replied to
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp({ content: 'Processing your request...', ephemeral: true });
            } else {
                await interaction.deferReply({ ephemeral: true });
            }

            // Check for necessary permissions
            const hasPermission = await checkPermissions(interaction, supportRoleId);
            if (!hasPermission) {
                return this.respondToInteraction(interaction, 'You do not have permission to create a ticket panel.');
            }

            const channel = interaction.options.getChannel('channel');

            // Check if the bot has permissions in the specified channel
            if (!channel.viewable || !channel.permissionsFor(interaction.client.user).has(['SendMessages', 'EmbedLinks'])) {
                return this.respondToInteraction(interaction, 'I do not have sufficient permissions to send messages or embeds in the specified channel.');
            }

            // Check if the user already has a ticket panel open
            const existingPanel = channel.messages.cache.find(message => 
                message.embeds[0]?.title === '🎫 Support Tickets' && message.author.id === interaction.client.user.id
            );

            if (existingPanel) {
                return this.respondToInteraction(interaction, 'A ticket panel already exists in this channel.');
            }

            // Create the ticket panel embed and button
            const ticketEmbed = new EmbedBuilder()
                .setTitle('🎫 Support Tickets')
                .setDescription('Click the button below to create a ticket!')
                .setColor(0x00BFFF)
                .setFooter({ text: 'Support Ticket System' })
                .setTimestamp();

            const button = new ButtonBuilder()
                .setCustomId('create-ticket')
                .setLabel('Create Ticket')
                .setStyle(ButtonStyle.Primary)
                .setEmoji('🎫');

            const row = new ActionRowBuilder().addComponents(button);

            // Send the embed and button to the specified channel
            await channel.send({ embeds: [ticketEmbed], components: [row] });

            // Confirm the ticket panel has been created
            return this.respondToInteraction(interaction, 'Ticket panel created successfully!');
        } catch (error) {
            console.error('Error creating ticket panel:', error);
            return this.respondToInteraction(interaction, 'An error occurred while creating the ticket panel. Please try again or contact an administrator.');
        }
    },

    // Helper method to respond to the interaction
    async respondToInteraction(interaction, message) {
        if (interaction.replied || interaction.deferred) {
            return interaction.followUp({ content: message, ephemeral: true });
        } else {
            return interaction.reply({ content: message, ephemeral: true });
        }
    },
};
