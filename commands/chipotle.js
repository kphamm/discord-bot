require("dotenv").config();
const { MessageEmbed } = require('discord.js');
const { SlashCommandBuilder } = require("@discordjs/builders");
const { DiscordAPIError } = require("discord.js");
const rp = require("request-promise");
const fetch = require('node-fetch');
const etherscan = process.env.etherscan;
const opensea = process.env.opensea;
const coin = process.env.coin;

const data = new SlashCommandBuilder()
  .setName("chipotle")
  .setDescription("Link to send chipotle code text")
  .addStringOption((option) =>
    option
      .setName("code")
      .setDescription(
        "chipotle code"
      )
      .setRequired(true)
  );



module.exports = {
  data,
  async execute(interaction) {
    const code = interaction.options.getString("code");

    const embed = new MessageEmbed()
    .setColor('#2ECC71')
    .setTitle("FREE CHIPOTLE")
    .setURL(`https://chipotlebywayve.com/?c=${code}`)
    .addFields(
        { name: 'LINK', value: `https://chipotlebywayve.com/?c=${code}`, inline: true },
    );

    return interaction.reply({
        embeds: [embed],
        ephemeral: false,
    });
  },
};
