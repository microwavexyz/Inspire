// checkPermissions.js

export default function checkPermissions(interaction, requiredRoleId) {
    return interaction.member.roles.cache.has(requiredRoleId);
}
