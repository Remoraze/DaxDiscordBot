require("dotenv").config();
const { Client, GatewayIntentBits, SlashCommandBuilder, REST, Routes } = require("discord.js");

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildModeration,
        GatewayIntentBits.GuildMembers
    ]
});

const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;
const SWEAR_WORDS = ["nigger", "cunt", "fuck", "motherfucker", "bitch", "fucking,", "fvck", "shit"];

client.on("guildMemberAdd", async (member) => {
    const roleName = "Member"; // Change this to the exact role name
    const role = member.guild.roles.cache.find(r => r.name === roleName);

    if (role) {
        try {
            await member.roles.add(role);
            console.log(`✅ Assigned "${roleName}" role to ${member.user.tag}`);
        } catch (error) {
            console.error(`❌ Failed to assign role to ${member.user.tag}:`, error);
        }
    } else {
        console.error(`❌ Role "${roleName}" not found in guild ${member.guild.name}`);
    }
});


// 8ball responses
const MAGIC_8BALL_RESPONSES = [
    "It is certain", "Without a doubt", "You may rely on it", "Yes definitely",
    "It is decidedly so", "As I see it, yes", "Most likely", "Yes",
    "Outlook good", "Signs point to yes", "Reply hazy try again",
    "Better not tell you now", "Ask again later", "Cannot predict now",
    "Concentrate and ask again", "Don't count on it", "My reply is no",
    "My sources say no", "Outlook not so good", "Very doubtful"
];

// Roast responses
const ROAST_RESPONSES = [
    "I'd roast you, but my mom said I'm not allowed to burn trash.",
    "You're like a cloud - when you disappear, it's a beautiful day.",
    "If laughter is the best medicine, your face must be curing the world.",
    "You have an entire life to be an idiot. Why not take today off?",
    "Your family tree must be a cactus because everyone on it is a prick.",
    "You're so ugly, when your mom dropped you off at school she got a fine for littering.",
    "You bring everyone so much joy... when you leave the room.",
    "If I had a face like yours, I'd sue my parents.",
    "If stupidity was a profession, you'd be a billionaire.",
    "You're the reason God created the middle finger.",
    "You're not stupid; you just have bad luck thinking."
];

// Register commands
const commands = [
    new SlashCommandBuilder()
        .setName("help")
        .setDescription("Get information about Dax."),
    new SlashCommandBuilder()
        .setName("whosaretard")
        .setDescription("Randomly picks a member and calls them an Retard."),
    new SlashCommandBuilder()
        .setName("8ball")
        .setDescription("Ask the Magic 8 Ball a question")
        .addStringOption(option =>
            option.setName("question")
                .setDescription("What do you want to ask?")
                .setRequired(true)),
    new SlashCommandBuilder()
        .setName("coinflip")
        .setDescription("Flip a coin - heads or tails"),
    new SlashCommandBuilder()
        .setName("yesno")
        .setDescription("Get a yes, no, or maybe response"),
    new SlashCommandBuilder()
        .setName("roast")
        .setDescription("Roast a user")
        .addUserOption(option =>
            option.setName("target")
                .setDescription("The user to roast")
                .setRequired(true))
].map(command => command.toJSON());

client.once("ready", async () => {
    console.log(`Bot is online as ${client.user.tag}`);

    const rest = new REST({ version: "10" }).setToken(DISCORD_BOT_TOKEN);
    try {
        await rest.put(Routes.applicationCommands(CLIENT_ID), { body: commands });
        console.log("✅ Slash commands registered globally.");
    } catch (error) {
        console.error("❌ Error registering slash commands:", error);
    }
});

client.on("interactionCreate", async (interaction) => {
    if (!interaction.isCommand()) return;

    if (interaction.commandName === "whosaretard") {
        const members = await interaction.guild.members.fetch();
        const randomMember = members.random();

        if (!randomMember) {
            await interaction.reply("Could not find a random member.");
            return;
        }

        await interaction.reply(`${randomMember} is an Retard!`);
    } else if (interaction.commandName === "help") {
        await interaction.reply(
            "Hello! You can use:\n" +
            "- /whoisaretard: Pick a random retard\n" +
            "- /8ball: Ask the magic 8 ball a question\n" +
            "- /coinflip: Flip a coin\n" +
            "- /yesno: Get a yes/no answer\n" +
            "- /roast: Roast someone\n" +
            "- /help: Show this message"
        );
    } else if (interaction.commandName === "8ball") {
        const question = interaction.options.getString("question");
        const response = MAGIC_8BALL_RESPONSES[Math.floor(Math.random() * MAGIC_8BALL_RESPONSES.length)];
        await interaction.reply(`Question: ${question}\n🎱 ${response}`);
    } else if (interaction.commandName === "coinflip") {
        const result = Math.random() < 0.5 ? "Heads" : "Tails";
        await interaction.reply(`🪙 The coin landed on: **${result}**!`);
    } else if (interaction.commandName === "yesno") {
        const random = Math.random() * 100;
        let response;
        if (random < 46) {
            response = "Yes";
        } else if (random < 92) {
            response = "No";
        } else {
            response = "Maybe";
        }
        await interaction.reply(`🤔 **${response}**`);
    } else if (interaction.commandName === "roast") {
        const target = interaction.options.getUser("target");
        const roast = ROAST_RESPONSES[Math.floor(Math.random() * ROAST_RESPONSES.length)];
        await interaction.reply(`Hey ${target}... ${roast} 🔥`);
    }
});

client.on("messageCreate", async (message) => {
    if (message.author.bot) return;
    const messageContent = message.content.toLowerCase();

    if (SWEAR_WORDS.some(word => messageContent.includes(word))) {
        try {
            await message.delete();
            const member = message.guild.members.cache.get(message.author.id);

            if (member && member.moderatable) {
                await member.timeout(600 * 1000, "Swearing is not allowed!");
                await message.channel.send(`${message.author} has been timed out for 10 minutes!`);
            } else {
                await message.channel.send(`I don't have permission to timeout ${message.author}.`);
            }
        } catch (error) {
            console.error("Error timing out user:", error);
        }
    }
});

client.login(DISCORD_BOT_TOKEN);
