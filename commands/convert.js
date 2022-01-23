require("dotenv").config();
const { SlashCommandBuilder } = require("@discordjs/builders");
const { DiscordAPIError } = require("discord.js");
const rp = require("request-promise");
const coin = process.env.coin;

const data = new SlashCommandBuilder()
  .setName("convert")
  .setDescription("Converts a crypto to another")
  .addStringOption((option) =>
    option
      .setName("input")
      .setDescription(
        "<number> <crypto you want to convert> <crypto you want to convert to>"
      )
      .setRequired(true)
  );

module.exports = {
  data,
  async execute(interaction) {
    const input = interaction.options.getString("input");
    const inputArr = input.split(" ");
    const num = inputArr[0];
    const firstCrypto = inputArr[1].toUpperCase();
    const secondCrypto = inputArr[2].toUpperCase();
    let firstCryptoPrice, secondCryptoPrice;
    const firstCryptoCall = {
      method: "GET",
      uri: "https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest",
      qs: {
        symbol: `${firstCrypto}`,
      },
      headers: {
        "X-CMC_PRO_API_KEY": `${coin}`,
      },
      json: true,
      gzip: true,
    };
    await rp(firstCryptoCall)
      .then((response) => {
        firstCryptoPrice = response.data[`${firstCrypto}`].quote.USD.price;
      })
      .catch((err) => {
        console.log("API call error:", err.message);
      });

    const secondCryptoCall = {
      method: "GET",
      uri: "https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest",
      qs: {
        symbol: `${secondCrypto}`,
      },
      headers: {
        "X-CMC_PRO_API_KEY": `${coin}`,
      },
      json: true,
      gzip: true,
    };
    await rp(secondCryptoCall)
      .then((response) => {
        secondCryptoPrice = response.data[`${secondCrypto}`].quote.USD.price;
      })
      .catch((err) => {
        console.log("API call error:", err.message);
      });

    const answer = ((num * firstCryptoPrice) / secondCryptoPrice).toFixed(2);
    return interaction.reply({
      content: `${num} ${firstCrypto} is equal to ${answer} ${secondCrypto}`,
      ephemeral: false,
    });
  },
};
