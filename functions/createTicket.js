import { ChannelType, PermissionFlagsBits, EmbedBuilder } from 'discord.js';

export async function handleCreateTicket(interaction) {
    try {
        // Check if the interaction has already been replied to or deferred
        if (!interaction.replied && !interaction.deferred) {
            await interaction.deferUpdate();
        }

        const guild = interaction.guild;
        const user = interaction.user;

        // Create a new channel for the ticket
        const channel = await guild.channels.create({
            name: `ticket-${user.username}`,
            type: ChannelType.GuildText,
            permissionOverwrites: [
                {
                    id: guild.id,
                    deny: [PermissionFlagsBits.ViewChannel],
                },
                {
                    id: user.id,
                    allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages],
                },
                // Add permissions for support role if needed
            ],
        });

        // Create an embed for the welcome message
        const welcomeEmbed = new EmbedBuilder()
            .setTitle('🎫 Ticket Created')
            .setDescription(`Welcome ${user}! Support will be with you shortly.`)
            .setColor('#00FF00')
            .setTimestamp();

        // Send the welcome message in the new ticket channel
        await channel.send({ embeds: [welcomeEmbed] });

        // Create an embed for the user response
        const responseEmbed = new EmbedBuilder()
            .setTitle('🎫 Ticket Created')
            .setDescription(`Your ticket has been created in ${channel}.`)
            .setColor('#00FF00')
            .setTimestamp();

        // Respond to the user
        if (interaction.replied || interaction.deferred) {
            await interaction.followUp({ embeds: [responseEmbed], ephemeral: true });
        } else {
            await interaction.reply({ embeds: [responseEmbed], ephemeral: true });
        }
    } catch (error) {
        console.error('Error creating ticket:', error);

        // Create an embed for the error message
        const errorEmbed = new EmbedBuilder()
            .setTitle('❌ Error')
            .setDescription('There was an error creating your ticket. Please try again later.')
            .setColor('#FF0000')
            .setTimestamp();

        if (interaction.replied || interaction.deferred) {
            await interaction.followUp({ embeds: [errorEmbed], ephemeral: true });
        } else {
            await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
        }
    }
}
