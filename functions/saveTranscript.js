import { AttachmentBuilder, EmbedBuilder } from 'discord.js';
import { createTranscript } from 'discord-html-transcripts';

export async function saveTranscript(channel, logChannel) {
    try {
        // Create the transcript
        const transcript = await createTranscript(channel, {
            limit: -1,
            returnType: 'buffer', // Use 'returnType' instead of 'returnBuffer'
            fileName: `transcript-${channel.id}.html`,
        });

        // Create an Embed for the transcript
        const transcriptEmbed = new EmbedBuilder()
            .setTitle('Ticket Transcript')
            .setDescription(`Transcript for ticket: ${channel.name}`)
            .setColor('#00ff00')
            .setTimestamp();

        // Create an AttachmentBuilder using the transcript buffer
        const attachment = new AttachmentBuilder(transcript, { name: `transcript-${channel.id}.html` });

        // Send the transcript to the log channel
        await logChannel.send({ embeds: [transcriptEmbed], files: [attachment] });

        return { transcriptEmbed, attachment };
    } catch (error) {
        console.error('Error creating transcript:', error);
        throw error; // Re-throw the error to be handled by the calling function
    }
}
