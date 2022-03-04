module.exports = {
  name: 'ready',
  async execute(client) {
    console.log('LCDEV - BOT INICIADO COM SUCESSO')

    const status = ["dnd"];

    const atividades = [[`Brasil Haakon Roleplay`, "WATCHING"]];
  
    setInterval(async () => {
      const i = Math.floor(Math.random() * atividades.length + 1) - 1;
      await client.user.setActivity(atividades[i][0], {
        type: atividades[i][1],
      });
    }, 20000);
  
    setInterval(async () => {
      const b = Math.floor(Math.random() * status.length + 1) - 1;
      await client.user.setStatus(status[b]);
    }, 20000);

    const oniChan = client.channels.cache.get(client.config.ticketChannel)

    function sendTicketMSG() {
      const embed = new client.discord.MessageEmbed()
        .setColor('6d6ee8')
        .setAuthor('Central de Atendimento!')
        .setDescription('Olá, se você está lendo isso aqui, provavelmente está precisando de ajuda. Selecione a categoria abaixo de acordo com sua necessidade e aguarde um membro da nossa equipe responder!')
        .setImage("https://media.discordapp.net/attachments/944644901574963201/944726734295662652/e73e5ce1a2e68a6e5753ca74dc4ecd50.png?width=473&height=473")      
        .setFooter("Brasil Haakon Roleplay - Todos os direitos reservados")
        const row = new client.discord.MessageActionRow()
        .addComponents(
          new client.discord.MessageButton()
          .setCustomId('open-ticket')
          .setLabel('Clique aqui para abrir o ticket!')
          .setEmoji('✉️')
          .setStyle('SUCCESS'),
        );

      oniChan.send({
        embeds: [embed],
        components: [row]
      })
    }

    const toDelete = 10000;

    async function fetchMore(channel, limit) {
      if (!channel) {
        throw new Error(`O seu ticket foi aberto com sucesso ${typeof channel}.`);
      }
      if (limit <= 100) {
        return channel.messages.fetch({
          limit
        });
      }

      let collection = [];
      let lastId = null;
      let options = {};
      let remaining = limit;

      while (remaining > 0) {
        options.limit = remaining > 100 ? 100 : remaining;
        remaining = remaining > 100 ? remaining - 100 : 0;

        if (lastId) {
          options.before = lastId;
        }

        let messages = await channel.messages.fetch(options);

        if (!messages.last()) {
          break;
        }

        collection = collection.concat(messages);
        lastId = messages.last().id;
      }
      collection.remaining = remaining;

      return collection;
    }

    const list = await fetchMore(oniChan, toDelete);

    let i = 1;

    list.forEach(underList => {
      underList.forEach(msg => {
        i++;
        if (i < toDelete) {
          setTimeout(function () {
            msg.delete()
          }, 1000 * i)
        }
      })
    })

    setTimeout(() => {
      sendTicketMSG()
    }, i);
  },
};
