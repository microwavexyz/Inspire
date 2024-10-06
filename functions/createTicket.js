import { ChannelType, PermissionFlagsBits, EmbedBuilder } from 'discord.js';

const supportRoleId = process.env.SUPPORT_ROLE_ID || '1282106458443485294';
const ticketCategoryId = '1282124076000739399';

export async function handleCreateTicket(interaction) {
    try {
        // Check if the interaction has already been replied to or deferred
        if (!interaction.replied && !interaction.deferred) {
            await interaction.deferUpdate();
        }

        const guild = interaction.guild;
        const user = interaction.user;

        // Check if the user already has a ticket open
        const existingChannel = guild.channels.cache.find(channel => 
            channel.name === `ticket-${user.username}` && channel.type === ChannelType.GuildText
        );

        if (existingChannel) {
            // Create an embed for the error message
            const errorEmbed = new EmbedBuilder()
                .setTitle('❌ Error')
                .setDescription('You already have an open ticket. Please use the existing ticket or wait for it to be closed before creating a new one.')
                .setColor('#FF0000')
                .setTimestamp();

            if (interaction.replied || interaction.deferred) {
                await interaction.followUp({ embeds: [errorEmbed], ephemeral: true });
            } else {
                await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
            }
            return;
        }

        // Create a new channel for the ticket inside the specified category
        const channel = await guild.channels.create({
            name: `ticket-${user.username}`,
            type: ChannelType.GuildText,
            parent: ticketCategoryId,
            permissionOverwrites: [
                {
                    id: guild.id,
                    deny: [PermissionFlagsBits.ViewChannel],
                },
                {
                    id: user.id,
                    allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages],
                },
                {
                    id: supportRoleId,
                    allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages],
                },
            ],
        });

        // Create an embed for the welcome message
        const welcomeEmbed = new EmbedBuilder()
            .setTitle('🎫 Ticket Created')
            .setDescription(`Welcome ${user}! Support will be with you shortly.`)
            .setColor('#00FF00')
            .setTimestamp();

        // Send the welcome message in the new ticket channel and ping the support role and user
        await channel.send({ 
            content: `<@&${supportRoleId}> <@${user.id}>`, 
            embeds: [welcomeEmbed] 
        });

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
