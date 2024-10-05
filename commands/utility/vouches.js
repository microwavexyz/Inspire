import { SlashCommandBuilder } from '@discordjs/builders';
import { EmbedBuilder } from 'discord.js';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default {
    data: new SlashCommandBuilder()
        .setName('vouches')
        .setDescription('View vouches for a user')
        .addUserOption(option => 
            option.setName('user')
                .setDescription('The user to view vouches for')
                .setRequired(true)),

    async execute(interaction) {
        const user = interaction.options.getUser('user');
        const vouchesPath = path.join(__dirname, '../../data/vouches.json');

        let vouches = [];
        try {
            const data = await fs.readFile(vouchesPath, 'utf8');
            vouches = JSON.parse(data);
        } catch (error) {
            if (error.code === 'ENOENT') {
                return interaction.reply({ content: 'No vouches found for any user.', ephemeral: true });
            }
            console.error('Error reading vouches file:', error);
            return interaction.reply({ content: 'There was an error retrieving vouches. Please try again later.', ephemeral: true });
        }

        const userVouches = vouches.filter(vouch => vouch.vouchedUserId === user.id);

        if (userVouches.length === 0) {
            return interaction.reply({ content: `No vouches found for ${user.username}.`, ephemeral: true });
        }

        const totalRating = userVouches.reduce((sum, vouch) => sum + vouch.rating, 0);
        const averageRating = (totalRating / userVouches.length).toFixed(1);

        const categoryCount = userVouches.reduce((acc, vouch) => {
            acc[vouch.category] = (acc[vouch.category] || 0) + 1;
            return acc;
        }, {});

        const embed = new EmbedBuilder()
            .setTitle(`Vouches for ${user.username}`)
            .setDescription(`Total vouches: ${userVouches.length}\nAverage rating: ${'⭐'.repeat(Math.round(averageRating))} (${averageRating})`)
            .addFields(
                { name: 'Categories', value: Object.entries(categoryCount).map(([category, count]) => `${category}: ${count}`).join('\n') },
                { name: 'Recent Vouches', value: userVouches.slice(-5).map(vouch => 
                    `[${new Date(vouch.timestamp).toLocaleDateString()}] ${vouch.category} - ${'⭐'.repeat(vouch.rating)}\n${vouch.comment}`
                ).join('\n\n') }
            )
            .setColor('#0099ff')
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },
};
