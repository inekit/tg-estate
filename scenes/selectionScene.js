const {
  CustomWizardScene,
  titles,
  createKeyboard,
  handlers: { FilesHandler },
} = require("telegraf-steps-engine");
const {
  Composer,
  Scenes: { BaseScene },
} = require("telegraf");

const clientScene = new CustomWizardScene("selectionScene").enter(
  async (ctx) => {
    delete ctx.wizard.state.input;

    ctx.scene.state.selectedIS = {
      рестораны: false,
      бары: false,
      супермаркеты: false,
      школы: false,
      "детские сады": false,
    };

    ctx.scene.state.selectedUD = {
      балкон: false,
      парковка: false,
      бассейн: false,
      интернет: true,
    };

    ctx.replyStep(0);
  }
);

const isHandler = new Composer();

isHandler.action(/toogle\_(.+)/g, (ctx) => {
  const name = ctx.match[1];

  ctx.scene.state.selectedIS[name] = !ctx.scene.state.selectedIS[name];
  ctx.editMenu("ENTER_INFRASTRUCTURE", {
    name: "infrastructure_keyboard",
    args: [ctx.scene.state.selectedIS],
  });
});
isHandler.on("text", (ctx) => {
  ctx.scene.state.additionalIS = ctx.message.text;

  ctx.replyWithKeyboard("ADD_INFRASTRUCTURE", {
    name: "infrastructure_keyboard",
    args: [ctx.scene.state.selectedIS],
  });
});

isHandler.action("confirm", (ctx) => {
  ctx.scene.state.input.infrastructure =
    Object.entries(ctx.scene.state.selectedIS)
      .filter(([name, val]) => val === true)
      .map(([name, val]) => name)
      .join(", ") +
    (ctx.scene.state.additionalIS ? ", " + ctx.scene.state.additionalIS : "");

  ctx.replyNextStep();
});

const udHandler = new Composer();

udHandler.action(/toogle\_(.+)/g, (ctx) => {
  const name = ctx.match[1];

  ctx.scene.state.selectedUD[name] = !ctx.scene.state.selectedUD[name];
  ctx.editMenu("ENTER_UDOBSTVA", {
    name: "udobstva_keyboard",
    args: [ctx.scene.state.selectedUD],
  });
});
udHandler.on("text", (ctx) => {
  ctx.scene.state.additionalUD = ctx.message.text;

  ctx.replyWithKeyboard("ADD_UDOBSTVA", {
    name: "udobstva_keyboard",
    args: [ctx.scene.state.selectedUD],
  });
});

udHandler.action("confirm", (ctx) => {
  ctx.scene.state.input.udobstva =
    Object.entries(ctx.scene.state.selectedUD)
      .filter(([name, val]) => val === true)
      .map(([name, val]) => name)
      .join(", ") +
    (ctx.scene.state.additionalUD ? ", " + ctx.scene.state.additionalUD : "");
  ctx.replyNextStep();
});

clientScene
  .addSelect({
    variable: "type",
    options: {
      Апартаменты: "Апартаменты",
      Студия: "Студия",
      Кондо: "Кондо",
      Дом: "Дом",
      Вилла: "Вилла",
    },
    cb: async (ctx) => {
      await ctx.answerCbQuery().catch(console.log);
      ctx.wizard.state.input = {
        type: ctx.match[0],
      };

      ctx.replyNextStep();
    },
    onInput: async (ctx) => {
      ctx.wizard.state.input = {
        type: ctx.message.text,
      };

      ctx.replyNextStep();
    },
  })
  .addStep({
    variable: "people_count",
    confines: ["less100"],
  })
  .addStep({
    variable: "rooms_count",
    confines: [
      (text) => {
        if (parseInt(text) != text || parseInt(text) > 20) return;
        return true;
      },
    ],
  })
  .addStep({
    variable: "period",
    confines: ["number", "less100"],
  })
  .addStep({
    variable: "date",
    confines: ["laterNow"],
  })
  .addStep({
    variable: "budget",
    confines: [
      /* (text) => {
        if (parseInt(text) != text || parseInt(text) > 1000000000) return;
        return true;
      },*/
    ],
  })
  .addStep({
    variable: "infrastructure",
    keyboard: "infrastructure_keyboard",
    handler: isHandler,
  })
  .addStep({
    variable: "udobstva",
    keyboard: "udobstva_keyboard",
    handler: udHandler,
  })
  .addStep({
    variable: "contact_name",
    confines: ["string45"],
  })
  .addStep({
    variable: "phone",
    confines: ["phone"],
  })
  .addSelect({
    variable: "comment",
    options: {
      Пропустить: "skip",
    },
    cb: async (ctx) => {
      await ctx.answerCbQuery().catch(console.log);
      await sendToAdmin(ctx);
      ctx.replyNextStep();
    },
    onInput: async (ctx) => {
      ctx.wizard.state.input.comment = ctx.message.text;
      await sendToAdmin(ctx);
      ctx.replyNextStep();
    },
  })
  .addSelect({
    variable: "reenter",
    title: "APPOINTMENT_SEND_SUCCESS",
    options: {
      "Новая заявка": "skip",
    },
    cb: async (ctx) => {
      await ctx.answerCbQuery().catch(console.log);
      ctx.scene.enter("clientScene");
    },
  });

async function sendToAdmin(ctx) {
  console.log(ctx.wizard.state);

  const admin_id = ctx.getTitle("ADMIN_ID");

  const username = ctx.from.username ? "@" + ctx.from.username : null;

  const appointment_id = parseInt(ctx.getTitle("LAST_APPOINTMENT_ID")) + 1;

  ctx.setTitle("LAST_APPOINTMENT_ID", appointment_id.toString());

  let main_message;

  const {
    type,
    people_count,
    rooms_count,
    period,
    date,
    budget,
    infrastructure,
    udobstva,
    contact_name,
    phone,
    comment,
  } = ctx.wizard.state.input;

  if (!username) {
    const user_message = await ctx.telegram.forwardMessage(
      admin_id,
      ctx.from.id,
      ctx.wizard.state.message_id
    );

    main_message = await ctx.telegram.sendMessage(
      admin_id,
      ctx.getTitle("NEW_APPOINTMENT_SELECTION", [
        appointment_id,
        type,
        people_count,
        rooms_count,
        period,
        date,
        budget,
        infrastructure,
        udobstva,
        contact_name,
        username,
        phone,
        comment ?? "Нет",
      ]),
      {
        reply_to_message_id: user_message?.message_id,
        parse_mode: "HTML",
      }
    );
  }

  main_message = await ctx.telegram.sendMessage(
    admin_id,
    ctx.getTitle("NEW_APPOINTMENT_SELECTION", [
      appointment_id,
      type,
      people_count,
      rooms_count,
      period,
      date,
      budget,
      infrastructure,
      udobstva,
      contact_name,
      username,
      phone,
      comment ?? "Нет",
    ]),
    { parse_mode: "HTML" }
  );
}

module.exports = [clientScene];
