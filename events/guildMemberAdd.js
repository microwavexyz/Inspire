import { Events, EmbedBuilder, ChannelType } from 'discord.js';

export default {
    name: Events.GuildMemberAdd,
    async execute(member) {
        const welcomeChannelId = process.env.WELCOME_CHANNEL_ID || '1282157294271987714';

        try {
            const channel = await member.guild.channels.fetch(welcomeChannelId);

            if (!channel || channel.type !== ChannelType.GuildText) {
                console.error(`Channel with ID ${welcomeChannelId} not found or is not a text channel`);
                return;
            }

            const embed = new EmbedBuilder()
                .setTitle('🎉 Welcome to our Server!')
                .setDescription(`Hey ${member.user}, we're thrilled to have you join us! Feel free to introduce yourself and explore our channels.`)
                .setColor(0x4CAF50)
                .setThumbnail(member.user.displayAvatarURL({ dynamic: true, size: 256 }))
                .addFields(
                    { name: 'Member Count', value: `You're our ${member.guild.memberCount}${getOrdinalSuffix(member.guild.memberCount)} member!`, inline: true },
                    { name: 'Created At', value: `<t:${Math.floor(member.user.createdTimestamp / 1000)}:R>`, inline: true }
                )
                .setFooter({ text: `ID: ${member.id}` })
                .setTimestamp();

            await channel.send({ content: `Welcome, ${member.user}! 🎊`, embeds: [embed] });
            console.log(`Welcome message sent for ${member.user.tag}`);

            // Optional: Assign a default role
            // const defaultRole = member.guild.roles.cache.find(role => role.name === 'Member');
            // if (defaultRole) await member.roles.add(defaultRole);
        } catch (error) {
            console.error(`Error in guildMemberAdd event:`, error);
        }
    },
};

function getOrdinalSuffix(number) {
    const j = number % 10;
    const k = number % 100;
    if (j == 1 && k != 11) return "st";
    if (j == 2 && k != 12) return "nd";
    if (j == 3 && k != 13) return "rd";
    return "th";
}
