const { PermissionFlagsBits } = require('discord.js');

const ADMIN_PERMISSIONS = [
  PermissionFlagsBits.Administrator,
  PermissionFlagsBits.ManageGuild,
  PermissionFlagsBits.ManageMessages,
];

const MODERATOR_PERMISSIONS = [
  PermissionFlagsBits.ManageMessages,
  PermissionFlagsBits.ModerateMembers,
  PermissionFlagsBits.KickMembers,
];

const isAdmin = (member) => {
  return member.permissions.has(ADMIN_PERMISSIONS);
};

const isModerator = (member) => {
  return member.permissions.has(MODERATOR_PERMISSIONS) || isAdmin(member);
};

module.exports = {
  isAdmin,
  isModerator,
  ADMIN_PERMISSIONS,
  MODERATOR_PERMISSIONS,
};
