import { SlashCommandBuilder } from '@discordjs/builders';
import { EmbedBuilder } from 'discord.js';

export default {
    data: new SlashCommandBuilder()
        .setName('poll')
        .setDescription('Create and manage polls')
        .addSubcommand(subcommand =>
            subcommand
                .setName('create')
                .setDescription('Create a simple poll')
                .addStringOption(option => 
                    option.setName('question')
                        .setDescription('The poll question')
                        .setRequired(true))
                .addStringOption(option => 
                    option.setName('options')
                        .setDescription('Poll options separated by commas')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('end')
                .setDescription('End a poll')
                .addStringOption(option => 
                    option.setName('message_id')
                        .setDescription('The ID of the poll message')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('results')
                .setDescription('Get the results of a poll')
                .addStringOption(option => 
                    option.setName('message_id')
                        .setDescription('The ID of the poll message')
                        .setRequired(true))),
    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();

        if (subcommand === 'create') {
            const question = interaction.options.getString('question');
            const options = interaction.options.getString('options').split(',').map(option => option.trim());

            if (options.length < 2 || options.length > 10) {
                return interaction.reply({ content: 'Please provide between 2 and 10 options.', ephemeral: true });
            }

            const emoji = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'];
            
            const embed = new EmbedBuilder()
                .setColor('#0099ff')
                .setTitle(question)
                .setDescription(options.map((option, index) => `${emoji[index]} ${option}`).join('\n'))
                .setFooter({ text: 'React to vote!' });

            const pollMessage = await interaction.reply({ embeds: [embed], fetchReply: true });

            for (let i = 0; i < options.length; i++) {
                await pollMessage.react(emoji[i]);
            }
        } else if (subcommand === 'end') {
            const messageId = interaction.options.getString('message_id');
            const pollMessage = await interaction.channel.messages.fetch(messageId);

            if (!pollMessage) {
                return interaction.reply({ content: 'Poll message not found.', ephemeral: true });
            }

            const reactions = pollMessage.reactions.cache;
            const results = reactions.map(reaction => `${reaction.emoji.name}: ${reaction.count - 1}`).join('\n');

            const resultsEmbed = new EmbedBuilder()
                .setColor('#0099ff')
                .setTitle('Poll Results')
                .setDescription(results);

            await interaction.reply({ embeds: [resultsEmbed] });
        } else if (subcommand === 'results') {
            const messageId = interaction.options.getString('message_id');
            const pollMessage = await interaction.channel.messages.fetch(messageId);

            if (!pollMessage) {
                return interaction.reply({ content: 'Poll message not found.', ephemeral: true });
            }

            const reactions = pollMessage.reactions.cache;
            const results = reactions.map(reaction => `${reaction.emoji.name}: ${reaction.count - 1}`).join('\n');

            const resultsEmbed = new EmbedBuilder()
                .setColor('#0099ff')
                .setTitle('Poll Results')
                .setDescription(results);

            await interaction.reply({ embeds: [resultsEmbed] });
        }
    },
};
