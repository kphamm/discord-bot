require("dotenv").config();
const { SlashCommandBuilder } = require("@discordjs/builders");
const { DiscordAPIError } = require("discord.js");
const fetch = require('node-fetch');
const rp = require("request-promise");
const etherscan = process.env.etherscan;
const coin = process.env.coin;

const data = new SlashCommandBuilder()
  .setName("fees")
  .setDescription("Returns how much you have spent on gas fees")
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
    let totalGas = 0;
    let ethPrice;
    await fetch(`https://api.etherscan.io/api?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&page=1&offset=0&sort=asc&apikey=${etherscan}`)
    .then(response => {
        // indicates whether the response is successful (status code 200-299) or not
        if (!response.ok) {
            throw new Error(`Request failed with status ${response.status}`);
        }
        return response.json();
    })
    .then(response => {
        const obj = response.result;
        for (const property in obj) {
            const gas = Number(obj[property].gasUsed);
            const gasPrice = Number(obj[property].gasPrice);
            if(!isNaN(gas)){
                totalGas += gas * gasPrice;
            }
        }
    })
    .catch(error => console.log(error));

    const ethPriceCall = {
        method: "GET",
        uri: "https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest",
        qs: {
          symbol: 'ETH',
        },
        headers: {
          "X-CMC_PRO_API_KEY": `${coin}`,
        },
        json: true,
        gzip: true,
      };
      await rp(ethPriceCall)
        .then((response) => {
          ethPrice = response.data['ETH'].quote.USD.price;
        })
        .catch((err) => {
          console.log("API call error:", err.message);
        });
    totalGas = (totalGas / (10 ** 18)).toFixed(2);
    const usdGas = (totalGas*ethPrice).toFixed(2);
    return interaction.reply({
      content: `You have spent ${totalGas} eth on gas. Right now that's worth $${usdGas}`,
      ephemeral: false,
    });
  },
};
