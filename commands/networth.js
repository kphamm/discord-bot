require("dotenv").config();
const { SlashCommandBuilder } = require("@discordjs/builders");
const { DiscordAPIError } = require("discord.js");
const sdk = require('api')('@opensea/v1.0#1felivgkyk6vyw2');
const fetch = require('node-fetch');
const etherscan = process.env.etherscan;
const opensea = process.env.opensea

const data = new SlashCommandBuilder()
  .setName("networth")
  .setDescription("Returns a wallet's networth")
  .addStringOption((option) =>
    option
      .setName("address")
      .setDescription(
        "wallet address"
      )
      .setRequired(true)
  );

module.exports = {
  data,
  async execute(interaction) {
    const address = interaction.options.getString("address");
    let balance;
    await fetch(`https://api.etherscan.io/api?module=account&action=balance&address=${address}&tag=latest&apikey=${etherscan}`)
    .then(response => {
        // indicates whether the response is successful (status code 200-299) or not
        if (!response.ok) {
            throw new Error(`Request failed with status ${response.status}`);
        }
        return response.json();
    })
    .then(response => {
        balance = (response.result / (10 ** 18)).toFixed(2);
    })
    .catch(error => console.log(error));

    // sdk['getting-assets']({
    //     owner: '0x6E36ad41DF9Bd51D58d17352b03b69B7f1619ae9',
    //     order_by: 'TOTAL_PRICE',
    //     order_direction: 'desc',
    //     offset: '0',
    //     limit: '20',
    //     'X-API-KEY': '5ef1a3e29dfd46308ce02f70d59f4e0b'
    //   })
    //     .then(res => console.log(res))
    //     .catch(err => console.error(err));

    // collect assets
    // collect count of each asset
    // do a call for each collection and get floor
    // multiple quantiy by floor then sum them up then add to balance

    return interaction.reply({
      content: `ur wallet has ${balance} eth`,
      ephemeral: false,
    });
  },
};
