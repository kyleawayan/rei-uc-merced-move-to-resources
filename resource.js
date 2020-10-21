const Discord = require("discord.js");
const ytdl = require("ytdl-core");

module.exports = {
  name: "tor",
  description: "move message to resources channel",
  usage:
    "` (move your last sent message to the resources channel)\n`reina tor @user` (move user's last message to the resources channel)",

  execute(message, args) {
    message.channel.startTyping();
    const resourcesChannel = message.guild.channels.cache.find(
      (channel) =>
        channel.name === "︱resources" &&
        channel.parentID === message.channel.parentID
    );

    async function getLastMessage(tagged) {
      return new Promise((resolve) => {
        message.channel.messages
          .fetch({ before: message.id, limit: 5 })
          .then((messages) => {
            const messagesFromTagged = messages.find(
              (lastFiveMessages) => lastFiveMessages.author.id === tagged
            );
            resolve(messagesFromTagged);
          });
      });
    }

    async function copyMessage() {
      var lastMessage;
      var description = "";
      var beginArgs = 0;
      if (args[0] === undefined) {
        // you only ran rei tor and added no additional description
        lastMessage = await getLastMessage(message.author.id);
      } else {
        if (!args[0].match(new RegExp(/^\d+$/))) {
          // argument is not only numbers
          if (!args[0].startsWith("<")) {
            // if you didn't tag anyone, use first argument as description
            lastMessage = await getLastMessage(message.author.id);
          } else {
            // if args aren't a number (the message id): you tagged someone
            const tagged = args[0].slice(3, -1);
            lastMessage = await getLastMessage(tagged);
            beginArgs = 1;
          }
        } else {
          // the argument was only numbers, look for message id
          lastMessage = await message.channel.messages.fetch(args[0]);
          beginArgs = 1;
        }
      }
      if (args[beginArgs] !== undefined) {
        description = `${args.slice(beginArgs, 999).join(" ")}: `;
      }
      if (
        lastMessage.content.match(
          new RegExp(
            /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/
          )
        )
      ) {
        if (
          lastMessage.content.match(
            new RegExp(
              /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=|\?v=)([^#\&\?]*).*/
            )
          )
        ) {
          const ytVideoURL = lastMessage.content.match(/\bhttps?:\/\/\S+/gi)[0];
          ytVideoURL.match(
            new RegExp(
              /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=|\?v=)([^#\&\?]*).*/
            )
          );
          const videoInfo = await ytdl.getInfo(ytVideoURL);
          const copiedMessageEmbed = new Discord.MessageEmbed()
            .setTitle(description + lastMessage.content)
            .setAuthor(
              lastMessage.author.username,
              lastMessage.author.avatarURL()
            )
            .setDescription(
              `https://discord.com/channels/${lastMessage.channel.guild.id}/${lastMessage.channel.id}/${lastMessage.id}`
            )
            .setImage(videoInfo.videoDetails.thumbnail.thumbnails[3].url)
            .addFields({
              name: `${lastMessage.author.username} has embedded a YouTube video.`,
              value:
                "Please click on the link on the top of this message to go to it.",
            })
            .setTimestamp();
          sendMessageEmbed(copiedMessageEmbed);
        } else {
          const copiedMessageEmbed = new Discord.MessageEmbed()
            .setTitle(description + lastMessage.content)
            .setAuthor(
              lastMessage.author.username,
              lastMessage.author.avatarURL()
            )
            .setDescription(
              `https://discord.com/channels/${lastMessage.channel.guild.id}/${lastMessage.channel.id}/${lastMessage.id}`
            )
            .addFields({
              name: `${lastMessage.author.username} has embedded a link.`,
              value:
                "Please click on the link on the top of this message to go to it.",
            })
            .setTimestamp();
          sendMessageEmbed(copiedMessageEmbed);
        }
      } else if (lastMessage.attachments.first() !== undefined) {
        const copiedMessageEmbed = new Discord.MessageEmbed()
          .setTitle(description + lastMessage.content)
          .setAuthor(
            lastMessage.author.username,
            lastMessage.author.avatarURL()
          )
          .setDescription(
            `https://discord.com/channels/${lastMessage.channel.guild.id}/${lastMessage.channel.id}/${lastMessage.id}`
          )
          .setImage(lastMessage.attachments.first().url)
          .setTimestamp();
        sendMessageEmbed(copiedMessageEmbed);
      } else {
        const copiedMessageEmbed = new Discord.MessageEmbed()
          .setTitle(description + lastMessage.content)
          .setAuthor(
            lastMessage.author.username,
            lastMessage.author.avatarURL()
          )
          .setDescription(
            `https://discord.com/channels/${lastMessage.channel.guild.id}/${lastMessage.channel.id}/${lastMessage.id}`
          )
          .setTimestamp();
        sendMessageEmbed(copiedMessageEmbed);
      }
    }
    copyMessage();

    function sendMessageEmbed(copiedMessageEmbed) {
      resourcesChannel.send(copiedMessageEmbed);
      message.channel.stopTyping();
    }
  },
};
