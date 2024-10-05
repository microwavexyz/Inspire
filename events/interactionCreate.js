import { handleCreateTicket } from '../functions/createTicket.js';

export default {
    name: 'interactionCreate',
    async execute(interaction) {
        try {
            if (interaction.isCommand()) {
                await handleSlashCommand(interaction);
            } else if (interaction.isButton()) {
                await handleButtonInteraction(interaction);
            }
        } catch (error) {
            console.error('Error in interactionCreate:', error);
            await sendErrorResponse(interaction);
        }
    },
};

async function handleSlashCommand(interaction) {
    const { client } = interaction;
    const command = client.commands.get(interaction.commandName);

    if (!command) {
        console.error(`No command matching ${interaction.commandName} was found.`);
        return;
    }

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(`Error executing ${interaction.commandName}`);
        console.error(error);
        await sendErrorResponse(interaction);
    }
}

async function handleButtonInteraction(interaction) {
    if (interaction.customId === 'create-ticket') {
        try {
            await handleCreateTicket(interaction);
        } catch (error) {
            console.error('Error handling create-ticket button interaction:', error);
            await sendErrorResponse(interaction);
        }
    }
    // Handle other buttons if needed
}

async function sendErrorResponse(interaction) {
    const errorMessage = { content: 'There was an error while executing this command!', ephemeral: true };
    
    if (interaction.deferred || interaction.replied) {
        await interaction.followUp(errorMessage);
    } else {
        await interaction.reply(errorMessage);
    }
}
