import { SlashCommandBuilder } from '@discordjs/builders';
import { EmbedBuilder } from 'discord.js';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Necessary to obtain __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default {
    data: new SlashCommandBuilder()
        .setName('vouch')
        .setDescription('Vouch for a user')
        .addUserOption(option => 
            option.setName('user')
                .setDescription('The user to vouch for')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('category')
                .setDescription('The category of the vouch')
                .setRequired(true)
                .addChoices(
                    { name: 'Product', value: 'product' },
                    { name: 'Service', value: 'service' },
                    { name: 'Communication', value: 'communication' },
                    { name: 'Other', value: 'other' }
                ))
        .addIntegerOption(option =>
            option.setName('rating')
                .setDescription('Rate the user from 1 to 5 stars')
                .setRequired(true)
                .setMinValue(1)
                .setMaxValue(5))
        .addStringOption(option => 
            option.setName('comment')
                .setDescription('Your vouch comment')
                .setRequired(true)),

    async execute(interaction) {
        const vouchedUser = interaction.options.getUser('user');
        const category = interaction.options.getString('category');
        const rating = interaction.options.getInteger('rating');
        const comment = interaction.options.getString('comment');
        const vouchingUser = interaction.user;

        const vouchData = {
            vouchedUserId: vouchedUser.id,
            vouchingUserId: vouchingUser.id,
            category,
            rating,
            comment,
            timestamp: new Date().toISOString()
        };

        const vouchesPath = path.join(__dirname, '../../data/vouches.json');
        let vouches = [];

        try {
            const data = await fs.readFile(vouchesPath, 'utf8');
            vouches = JSON.parse(data);
        } catch (error) {
            if (error.code !== 'ENOENT') {
                console.error('Error reading vouches file:', error);
                return interaction.reply({ content: 'There was an error processing your vouch. Please try again later.', ephemeral: true });
            }
        }

        vouches.push(vouchData);

        try {
            await fs.writeFile(vouchesPath, JSON.stringify(vouches, null, 2));
        } catch (error) {
            console.error('Error writing vouches file:', error);
            return interaction.reply({ content: 'There was an error saving your vouch. Please try again later.', ephemeral: true });
        }

        const embed = new EmbedBuilder()
            .setTitle('New Vouch Received')
            .setDescription(`${vouchingUser} has vouched for ${vouchedUser}`)
            .addFields(
                { name: 'Category', value: category, inline: true },
                { name: 'Rating', value: '⭐'.repeat(rating), inline: true },
                { name: 'Comment', value: comment }
            )
            .setColor('#00FF00')
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },
};
