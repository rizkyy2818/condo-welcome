import 'dotenv/config';
import {
  Client,
  GatewayIntentBits,
  Events,
  EmbedBuilder,
} from 'discord.js';

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
  ],
});

// ═══════════════════════════════════════════════════════════════════
// CONFIG
// ═══════════════════════════════════════════════════════════════════

const WELCOME_CHANNEL_ID = process.env.WELCOME_CHANNEL_ID || '';
const MAPS_CHANNEL_ID    = process.env.MAPS_CHANNEL_ID || '';
const AUTO_ROLE_ID       = process.env.AUTO_ROLE_ID || '';
const COLOR              = 0x4b362a;

// ═══════════════════════════════════════════════════════════════════
// WELCOME EMBED
// ═══════════════════════════════════════════════════════════════════

function buildWelcomeEmbed(member) {
  const memberCount = member.guild.memberCount;
  const joinedTs = Math.floor(member.joinedTimestamp / 1000);

  const fields = [];

  if (MAPS_CHANNEL_ID) {
    fields.push({
      name: '🗺️ Check Condo Maps',
      value: `Head over to <#${MAPS_CHANNEL_ID}> to browse the latest condo maps.`,
      inline: false,
    });
  }

  fields.push(
    { name: '👥 Member',   value: `\`#${memberCount}\``,           inline: true },
    { name: '📥 Joined',   value: `<t:${joinedTs}:R>`,             inline: true },
    { name: '🏷️ Username', value: `\`${member.user.username}\``,  inline: true },
  );

  return new EmbedBuilder()
    .setColor(COLOR)
    .setAuthor({
      name: `Welcome to ${member.guild.name}!`,
      iconURL: member.guild.iconURL({ size: 128 }) || undefined,
    })
    .setTitle(`👋 Hey, ${member.user.username}!`)
    .setDescription(
      `Welcome to **${member.guild.name}**!\n` +
      `Hope you enjoy your stay 🎉`
    )
    .setThumbnail(member.user.displayAvatarURL({ size: 256 }))
    .addFields(...fields)
    .setFooter({ text: `ID: ${member.user.id}` })
    .setTimestamp();
}

// ═══════════════════════════════════════════════════════════════════
// EVENT: MEMBER JOIN
// ═══════════════════════════════════════════════════════════════════

client.on(Events.GuildMemberAdd, async (member) => {
  if (member.user.bot) return;

  console.log(`[JOIN] ${member.user.tag} joined ${member.guild.name}`);

  // ── Auto role ──
  if (AUTO_ROLE_ID) {
    try {
      await member.roles.add(AUTO_ROLE_ID);
      console.log(`[ROLE] Given to ${member.user.tag}`);
    } catch (err) {
      console.error('[ROLE] Failed:', err.message);
    }
  }

  // ── Welcome message ──
  if (WELCOME_CHANNEL_ID) {
    try {
      const channel = await member.guild.channels
        .fetch(WELCOME_CHANNEL_ID)
        .catch(() => null);

      if (channel) {
        await channel.send({
          content: `<@${member.user.id}>`,
          embeds: [buildWelcomeEmbed(member)],
        });
        console.log(`[WELCOME] Sent for ${member.user.tag}`);
      } else {
        console.error('[WELCOME] Channel not found:', WELCOME_CHANNEL_ID);
      }
    } catch (err) {
      console.error('[WELCOME] Failed:', err.message);
    }
  }
});

// ═══════════════════════════════════════════════════════════════════
// READY
// ═══════════════════════════════════════════════════════════════════

client.once(Events.ClientReady, (c) => {
  console.log(`[BOT] Logged in as ${c.user.tag}`);
  console.log(`[BOT] Uptime: ${new Date().toISOString()}`);
  console.log(`[BOT] Welcome channel: ${WELCOME_CHANNEL_ID || '(empty)'}`);
  console.log(`[BOT] Maps channel: ${MAPS_CHANNEL_ID || '(empty)'}`);
  console.log(`[BOT] Auto role: ${AUTO_ROLE_ID || '(empty)'}`);
});

// ═══════════════════════════════════════════════════════════════════
// ERROR GUARD
// ═══════════════════════════════════════════════════════════════════

process.on('unhandledRejection', (err) => console.error('[UNHANDLED]', err));
process.on('uncaughtException', (err) => console.error('[UNCAUGHT]', err));

client.login(process.env.DISCORD_TOKEN);
