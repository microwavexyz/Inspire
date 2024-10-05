import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import checkPermissions from '../../functions/checkPermissions.js';

const moderatorRoleId = process.env.MODERATOR_ROLE_ID || '1282106514668257357'; // Replace with your actual moderator role ID

export default {
    data: new SlashCommandBuilder()
        .setName('rules')
        .setDescription('Displays or updates the server rules.')
        .addSubcommand(subcommand =>
            subcommand
                .setName('show')
                .setDescription('Displays the server rules.'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('update')
                .setDescription('Updates a specific rule.')
                .addIntegerOption(option =>
                    option.setName('rule_number')
                        .setDescription('The number of the rule to update.')
                        .setRequired(true)
                        .setMinValue(1)
                        .setMaxValue(8))
                .addStringOption(option =>
                    option.setName('new_rule')
                        .setDescription('The new text for the rule.')
                        .setRequired(true)))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();

        if (subcommand === 'update' && !checkPermissions(interaction, moderatorRoleId)) {
            return interaction.reply({ content: 'You do not have permission to update the rules.', ephemeral: true });
        }

        const rulesEmbed = new EmbedBuilder()
            .setTitle('📜 Server Rules')
            .setDescription('Please read and follow these rules to ensure a friendly and enjoyable experience for everyone!')
            .addFields(
                { name: '1. Be Respectful', value: 'Treat everyone with respect. No harassment, bullying, or hate speech.' },
                { name: '2. No Spamming', value: 'Do not spam messages, links, or images. Keep the chat clean.' },
                { name: '3. Use Channels Appropriately', value: 'Post in the correct channels. Check the channel descriptions if you are unsure.' },
                { name: '4. No NSFW Content', value: 'This server is a safe space. Do not post or share NSFW (Not Safe For Work) content.' },
                { name: '5. Follow Discord ToS', value: 'All users must adhere to the [Discord Terms of Service](https://discord.com/terms) and [Community Guidelines](https://discord.com/guidelines).' },
                { name: '6. No Self-Promotion', value: 'Do not promote your own content, server, or links without permission.' },
                { name: '7. No Illegal Activity', value: 'Any discussions or activities related to illegal content are strictly prohibited.' },
                { name: '8. Respect Privacy', value: 'Do not share personal information (yours or others) without consent.' },
            )
            .setColor(0x00FF00)
            .setFooter({ text: 'Breaking any of these rules may result in a warning, mute, or ban.' })
            .setTimestamp();

        if (subcommand === 'show') {
            await interaction.reply({ embeds: [rulesEmbed], ephemeral: false });
        } else if (subcommand === 'update') {
            const ruleNumber = interaction.options.getInteger('rule_number');
            const newRule = interaction.options.getString('new_rule');

            rulesEmbed.data.fields[ruleNumber - 1].value = newRule;

            await interaction.reply({ content: `Rule ${ruleNumber} has been updated.`, embeds: [rulesEmbed], ephemeral: false });
        }
    },
};
