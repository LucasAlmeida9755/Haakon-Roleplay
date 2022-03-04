let hastebin = require('hastebin');

module.exports = {
  name: 'interactionCreate',
  async execute(interaction, client) {
    if (!interaction.isButton()) return;
    if (interaction.customId == "open-ticket") {
      if (client.guilds.cache.get(interaction.guildId).channels.cache.find(c => c.topic == interaction.user.id)) {
        return interaction.reply({
          content: 'O seu ticket foi criado com sucesso!',
          ephemeral: true
        });
      };

      interaction.guild.channels.create(`ticket-${interaction.user.username}`, {
        parent: client.config.parentOpened,
        topic: interaction.user.id,
        permissionOverwrites: [{
            id: interaction.user.id,
            allow: ['SEND_MESSAGES', 'VIEW_CHANNEL'],
          },
          {
            id: client.config.roleSupport,
            allow: ['SEND_MESSAGES', 'VIEW_CHANNEL'],
          },
          {
            id: interaction.guild.roles.everyone,
            deny: ['VIEW_CHANNEL'],
          },
        ],
        type: 'text',
      }).then(async c => {
        interaction.reply({
          content: `ticket criado com sucesso! <#${c.id}>`,
          ephemeral: true
        });

        const embed = new client.discord.MessageEmbed()
          .setColor('6d6ee8')
          .setAuthor('Ticket', 'https://cdn.discordapp.com/attachments/944644901574963201/944726734295662652/e73e5ce1a2e68a6e5753ca74dc4ecd50.png')
          .setDescription('Utilize a categoria correta, caso o contrário seu ticket será encerrado')
          .setFooter('LCDEV', 'https://cdn.discordapp.com/attachments/944644901574963201/944726734295662652/e73e5ce1a2e68a6e5753ca74dc4ecd50.png')
          .setTimestamp();

        const row = new client.discord.MessageActionRow()
          .addComponents(
            new client.discord.MessageSelectMenu()
            .setCustomId('category')
            .setPlaceholder('Utilize a categoria correta, caso o contrário seu ticket será encerrado')
            .addOptions([{
                label: 'Financeiro',
                value: 'financeiro',
                emoji: '🪙',
              },
              {
                label: 'Reportar bug',
                value: 'reportar bug',
                emoji: '🎮',
              },
              {
                label: 'Denúncias',
                value: 'denúncias',
                emoji: '📦',
              },
              {
                label: 'Denunciar Staff',
                value: 'denunciar staff',
                emoji: '🔧',
              },
              {
                label: 'Outros assuntos',
                value: 'outros assuntos',
                emoji: '📔',
              },
            ]),
          );

        msg = await c.send({
          content: `<@!${interaction.user.id}>`,
          embeds: [embed],
          components: [row]
        });

        const collector = msg.createMessageComponentCollector({
          componentType: 'SELECT_MENU',
          time: 20000
        });

        collector.on('collect', i => {
          if (i.user.id === interaction.user.id) {
            if (msg.deletable) {
              msg.delete().then(async () => {
                const embed = new client.discord.MessageEmbed()
                  .setColor('6d6ee8')
                  .setAuthor('Aguarde algum atendente...', 'https://cdn.discordapp.com/attachments/944644901574963201/944726734295662652/e73e5ce1a2e68a6e5753ca74dc4ecd50.png')
                  .setDescription(`<@!${interaction.user.id}> Dentro de alguns momentos ele será arrematado e respondido, fique a vontade para falar sua dúvida. Não se preocupe se você não for atendido ele irá fechar automaticamente, e você poderá abrir um novo posteriormente ${i.values[0]}`)
                  .setFooter('LCDEV', 'https://cdn.discordapp.com/attachments/944644901574963201/944726734295662652/e73e5ce1a2e68a6e5753ca74dc4ecd50.png')
                  .setTimestamp();

                const row = new client.discord.MessageActionRow()
                  .addComponents(
                    new client.discord.MessageButton()
                    .setCustomId('close-ticket')
                    .setLabel('Fechar ticket')
                    .setEmoji('899745362137477181')
                    .setStyle('DANGER'),
                  );

                const opened = await c.send({
                  content: `<@&${client.config.roleSupport}>`,
                  embeds: [embed],
                  components: [row]
                });

                opened.pin().then(() => {
                  opened.channel.bulkDelete(1);
                });
              });
            };
            if (i.values[0] == 'transaction') {
              c.edit({
                parent: client.config.parentTransactions
              });
            };
            if (i.values[0] == 'jeux') {
              c.edit({
                parent: client.config.parentJeux
              });
            };
            if (i.values[0] == 'autre') {
              c.edit({
                parent: client.config.parentAutres
              });
            };
          };
        });

        collector.on('end', collected => {
          if (collected.size < 1) {
            c.send(`Nenhum categoria foi selecionada crie um novo ticket!`).then(() => {
              setTimeout(() => {
                if (c.deletable) {
                  c.delete();
                };
              }, 5000);
            });
          };
        });
      });
    };

    if (interaction.customId == "close-ticket") {
      const guild = client.guilds.cache.get(interaction.guildId);
      const chan = guild.channels.cache.get(interaction.channelId);

      const row = new client.discord.MessageActionRow()
        .addComponents(
          new client.discord.MessageButton()
          .setCustomId('confirm-close')
          .setLabel('Confirmar fechamento do ticket')
          .setStyle('DANGER'),
          new client.discord.MessageButton()
          .setCustomId('no')
          .setLabel('Cancelar fechamento do ticket')
          .setStyle('SECONDARY'),
        );

      const verif = await interaction.reply({
        content: 'Você tem certeza que você quer fechar o ticket?',
        components: [row]
      });

      const collector = interaction.channel.createMessageComponentCollector({
        componentType: 'BUTTON',
        time: 10000
      });

      collector.on('collect', i => {
        if (i.customId == 'confirm-close') {
          interaction.editReply({
            content: `Ticket fechado por <@!${interaction.user.id}>`,
            components: []
          });

          chan.edit({
              name: `closed-${chan.name}`,
              permissionOverwrites: [
                {
                  id: client.users.cache.get(chan.topic),
                  deny: ['SEND_MESSAGES', 'VIEW_CHANNEL'],
                },
                {
                  id: client.config.roleSupport,
                  allow: ['SEND_MESSAGES', 'VIEW_CHANNEL'],
                },
                {
                  id: interaction.guild.roles.everyone,
                  deny: ['VIEW_CHANNEL'],
                },
              ],
            })
            .then(async () => {
              const embed = new client.discord.MessageEmbed()
                .setColor('6d6ee8')
                .setAuthor('Brasil Haakon Roleplay - Ticket', 'https://media.discordapp.net/attachments/944644901574963201/944726734295662652/e73e5ce1a2e68a6e5753ca74dc4ecd50.png?width=473&height=473')
                .setDescription('```Controle dos tickets```')
                .setFooter('LCDEV', 'https://media.discordapp.net/attachments/944644901574963201/944726734295662652/e73e5ce1a2e68a6e5753ca74dc4ecd50.png?width=473&height=473')
                .setTimestamp();

              const row = new client.discord.MessageActionRow()
                .addComponents(
                  new client.discord.MessageButton()
                  .setCustomId('delete-ticket')
                  .setLabel('Clique para exluir o Ticket')
                  .setEmoji('🗑️')
                  .setStyle('DANGER'),
                );

              chan.send({
                embeds: [embed],
                components: [row]
              });
            });

          collector.stop();
        };
        if (i.customId == 'no') {
          interaction.editReply({
            content: 'Fechamento do ticket cancelado!',
            components: []
          });
          collector.stop();
        };
      });

      collector.on('end', (i) => {
        if (i.size < 1) {
          interaction.editReply({
            content: 'Fechamento do ticket anulado!',
            components: []
          });
        };
      });
    };

    if (interaction.customId == "delete-ticket") {
      const guild = client.guilds.cache.get(interaction.guildId);
      const chan = guild.channels.cache.get(interaction.channelId);

      interaction.reply({
        content: 'Fazendo backup das mensagens...'
      });

      chan.messages.fetch().then(async (messages) => {
        let a = messages.filter(m => m.author.bot !== true).map(m =>
          `${new Date(m.createdTimestamp).toLocaleString('fr-FR')} - ${m.author.username}#${m.author.discriminator}: ${m.attachments.size > 0 ? m.attachments.first().proxyURL : m.content}`
        ).reverse().join('\n');
        if (a.length < 1) a = "Nothing"
        hastebin.createPaste(a, {
            contentType: 'text/plain',
            server: 'https://hastebin.com'
          }, {})
          .then(function (urlToPaste) {
            const embed = new client.discord.MessageEmbed()
              .setAuthor('Logs Ticket', 'https://cdn.discordapp.com/attachments/944644901574963201/944726734295662652/e73e5ce1a2e68a6e5753ca74dc4ecd50.png')
              .setDescription(`📰 Registro dos tickets\`${chan.id}\` criado por <@!${chan.topic}> fechado por <@!${interaction.user.id}>\n\nLogs: [**Cliquez aqui para ver as logs do ticket**](${urlToPaste})`)
              .setColor('2f3136')
              .setTimestamp();

            client.channels.cache.get(client.config.logsTicket).send({
              embeds: [embed]
            });
            chan.send('Excluindo canal......');

            setTimeout(() => {
              chan.delete();
            }, 5000);
          });
      });
    };
  },
};
