require("dotenv").config();
const { MessageEmbed } = require('discord.js');
const { SlashCommandBuilder } = require("@discordjs/builders");
const { DiscordAPIError } = require("discord.js");
const fetch = require('node-fetch');
const opensea = process.env.opensea;

const data = new SlashCommandBuilder()
  .setName("info")
  .setDescription("Returns how much you have spent on gas fees")
  .addSubcommand(subcommand =>
        subcommand
        .setName('contract')
        .setDescription('Info about a collection given a contract address')
        .addStringOption((option) =>
            option
            .setName("contract")
            .setDescription(
                "contract address"
            )
            .setRequired(true)
            ))
    .addSubcommand(subcommand =>
            subcommand
            .setName('osname')
            .setDescription('Info about a collection given the last part of the OS link')
            .addStringOption((option) =>
                option
                .setName("osname")
                .setDescription(
                    "OS Name"
                )
                .setRequired(true))
            );

const options = {
method: 'GET',
headers: { Accept: 'application/json', 'X-API-KEY': `${opensea}` }
};

module.exports = {
data,
async execute(interaction) {
    let contract = interaction.options.getString("contract");
    const osname = interaction.options.getString("osname");
    let name;
    let address;
    let slug;
    let image_url;
    let seller_fee_basis_points;
    let description;
    let external_url;
    let floor;
    let count;
    let num_owners;

    if (contract){
        await fetch(`https://api.opensea.io/api/v1/asset_contract/${contract}`, options)
            .then(response => response.json())
            .then(response => {
                name = response.name;
                address = response.address;
                slug = response.collection.slug;
                image_url = response.image_url;
                seller_fee_basis_points = response.seller_fee_basis_points / 100;
                description = response.collection.description;
                external_url = response.collection.external_url;
            })
            .catch(err => console.error(err));

        await fetch(`https://api.opensea.io/api/v1/collection/${slug}`, options)
            .then(response => response.json())
            .then(response => {
                floor = response.collection.stats.floor_price;
                count = response.collection.stats.count;
                num_owners = response.collection.stats.num_owners;
            })
            .catch(err => console.error(err));
    }
    else {
        slug = osname;
        await fetch(`https://api.opensea.io/api/v1/collection/${slug}`, options)
            .then(response => response.json())
            .then(response => {
                contract = response.collection.primary_asset_contracts[0].address;
                floor = response.collection.stats.floor_price;
                count = response.collection.stats.count;
                num_owners = response.collection.stats.num_owners;
            })
            .catch(err => console.error(err));


        await fetch(`https://api.opensea.io/api/v1/asset_contract/${contract}`, options)
        .then(response => response.json())
        .then(response => {
            name = response.name;
            address = response.address;
            slug = response.collection.slug;
            image_url = response.image_url;
            seller_fee_basis_points = response.seller_fee_basis_points / 100;
            description = response.collection.description;
            external_url = response.collection.external_url;
        })
        .catch(err => console.error(err));
    }
    const embed = new MessageEmbed()
        .setColor('#2ECC71')
        .setTitle(`${name}`)
        .setDescription(`${description}`)
        .setThumbnail(image_url)
        .addFields(
            { name: 'Floor', value: `${floor}`, inline: true },
            { name: 'Fees', value: `${seller_fee_basis_points}%`, inline: true },
            { name: 'Owner Ratio', value: `${(num_owners / count * 100).toFixed(2)}%`, inline: true}
        )
        .addFields(
            { name: 'Website', value: `[Website](${external_url})`, inline: true },
            { name: 'OpenSea', value: `[OpenSea](https://opensea.io/collection/${slug})`, inline: true },
            { name: 'LooksRare', value: `[LooksRare](https://looksrare.org/collections/${address})`, inline: true }
        )
        .addFields(
            { name: 'Contract', value: `[Etherscan](https://etherscan.io/address/${address})`, inline: true },
            { name: 'NFT Nerds', value: `[NFT Nerds](https://nftnerds.ai/collection/${slug})`, inline: true },
            { name: 'TraitSniper', value: `[TraitSniper](https://app.traitsniper.com/${slug})`, inline: true }
        );

    return interaction.reply({
    embeds: [embed],
    ephemeral: false,
    });
},
};
