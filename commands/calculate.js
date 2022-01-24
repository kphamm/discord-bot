const { SlashCommandBuilder } = require("@discordjs/builders");
const { MessageEmbed } = require('discord.js');

const data = new SlashCommandBuilder()
  .setName("calculate")
  .setDescription("Calculates the amount of gwei you should use")
  .addStringOption((option) =>
    option
      .setName("input")
      .setDescription(
        "<maxPrice> <mint price> <gas limit>"
      )
      .setRequired(true)
  );

module.exports = {
  data,
  async execute(interaction) {
    const input = interaction.options.getString("input");
    const inputArr = input.split(" ");
    const maxPrice = inputArr[0];
    const mintPrice = inputArr[1];
    const gasLimit = inputArr[2];
    const nineTenth = maxPrice * 9/10;
    const threeFourth = maxPrice * 3/4;
    const oneHalf = maxPrice * 1/2;
    const gweiNineTenth = (nineTenth - mintPrice) * 1000000000 / gasLimit;
    const gweiThreeFourth = (threeFourth - mintPrice) * 1000000000 / gasLimit;
    const gweiOneHalf = (oneHalf - mintPrice) * 1000000000 / gasLimit;

    const embed = new MessageEmbed()
        .setColor('#0099ff')
        .setTitle('Calculate')
        .addFields(
            { name: 'Gwei', value: `${gweiOneHalf}\n${gweiThreeFourth}\n${gweiNineTenth}`, inline: true },
            { name: 'Total Cost (ETH)', value: `${oneHalf}\n${threeFourth}\n${nineTenth}`, inline: true },
        );
    return interaction.reply({
        embeds: [embed],
        ephemeral: false,
    });
  },
};
