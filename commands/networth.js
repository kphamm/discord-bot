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

const options = {
  method: 'GET',
  headers: { Accept: 'application/json', 'X-API-KEY': `${opensea}` }
};

module.exports = {
  data,
  async execute(interaction) {
    const assets = new Map();
    await interaction.deferReply();
    const address = interaction.options.getString("address");
    let ethBalance = 0;
    let nftEthBalance = 0;
    let ethPrice;
    let breakLoop = false;
    let offset = 0;
    await fetch(`https://api.etherscan.io/api?module=account&action=balance&address=${address}&tag=latest&apikey=${etherscan}`)
    .then(response => {
        // indicates whether the response is successful (status code 200-299) or not
        if (!response.ok) {
            throw new Error(`Request failed with status ${response.status}`);
        }
        return response.json();
    })
    .then(response => {
        ethBalance = (response.result / (10 ** 18)).toFixed(2);
    })
    .catch(error => console.log(error));
    while(true){
      await fetch(`https://api.opensea.io/api/v1/assets?owner=${address}&order_direction=desc&offset=${offset}&limit=50`, options)
        .then(response => response.json())
        .then(response => {
          const obj = response.assets;
          let len = Object.keys(obj).length;
          if(len === 50){
            offset += 50;
          }
          else{
            breakLoop = true;
          }
          for (const property in obj) {
            const contractAddress = obj[property].collection.slug;
            if (!assets.has(`${contractAddress}`)){
              assets.set(`${contractAddress}`, 1);
            }
            else {
              assets.set(`${contractAddress}`, (assets.get(`${contractAddress}`))+1);
            }}})
        .catch(err => console.error(err));
        if(breakLoop){
          break;
        }
    }

    for (const [slug, count] of assets) {
        await fetch(`https://api.opensea.io/api/v1/collection/${slug}`, options)
          .then(response => response.json())
          .then(response => {
              let collectionPrice = response.collection.stats.floor_price;
              if(collectionPrice){
                nftEthBalance += (collectionPrice * count);
              }
          })
          .catch(err => console.error(err));
    }

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

      nftEthBalance = nftEthBalance.toFixed(2);
      const ethBalanceUSD = (ethPrice * ethBalance).toFixed(2);
      const nftEthBalanceUSD = (ethPrice * nftEthBalance).toFixed(2);

      const totalEthBalance = (Number(ethBalance) + Number(nftEthBalance)).toFixed(2);
      const totalEthBalanceUSD = (Number(ethBalanceUSD) + Number(nftEthBalanceUSD)).toFixed(2);

      const embed = new MessageEmbed()
        .setColor('#2ECC71')
        .setTitle('Networth')
        .setDescription('Calculates your wallet net worth')
        .setThumbnail('https://static.wikia.nocookie.net/maid-dragon/images/5/57/Kanna_Anime.png/revision/latest/scale-to-width-down/503?cb=20180225164809')
        .addFields(
            { name: 'Balance', value: `${ethBalance}\n$${ethBalanceUSD}\n`, inline: true },
            { name: 'NFTs', value: `${nftEthBalance}\n$${nftEthBalanceUSD}\n`, inline: true },
            { name: 'Total', value: `${totalEthBalance}\n$${totalEthBalanceUSD}\n`, inline: true },
        );

    return interaction.editReply({
      embeds: [embed],
      ephemeral: false,
    });
  },
};
