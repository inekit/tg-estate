const {
  CustomWizardScene,
  titles,
  createKeyboard,
  handlers: { FilesHandler },
} = require("telegraf-steps-engine");

const clientScene = new CustomWizardScene("clientScene").enter(async (ctx) => {
  delete ctx.wizard.state.input;

  ctx.wizard.state.estate_id = parseInt(ctx.startPayload);

  if (!ctx.startPayload) {
    await ctx.replyWithPhoto(ctx.getTitle("PREVIEW_ID")).catch(console.log);

    await ctx.replyWithTitle("START_SELECTION_TITLE");

    return ctx.scene.enter("selectionScene");
  }

  await ctx.replyWithPhoto(ctx.getTitle("PREVIEW_ID")).catch(console.log);
  ctx.replyWithKeyboard("START_TITLE", "new_appointment_keyboard");
});

clientScene.action("new_appointment", (ctx) => {
  ctx.answerCbQuery().catch((e) => {});

  if (!ctx.wizard.state.estate_id) ctx.replyStep(0);
  else ctx.replyStep(1);
});

clientScene.action("selection", (ctx) => {
  ctx.answerCbQuery().catch((e) => {});

  ctx.scene.enter("selectionScene");
});

clientScene
  .addStep({
    variable: "estate_id",
    //confines: ["number"],
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
    variable: "people_count",
    confines: ["less100"],
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

      //ctx.replyWithTitle("APPOINTMENT_SEND_SUCCESS");
    },
    onInput: async (ctx) => {
      ctx.wizard.state.input.comment = ctx.message.text;
      await sendToAdmin(ctx);
      //ctx.replyWithTitle("APPOINTMENT_SEND_SUCCESS");
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

  let main_message;

  const { phone, period, date, people_count, contact_name, comment } =
    ctx.wizard.state.input;

  const estate_id =
    ctx.wizard.state.estate_id && ctx.wizard.state.estate_id != NaN
      ? ctx.wizard.state.estate_id
      : ctx.wizard.state.input.estate_id;

  if (!username) {
    const user_message = await ctx.telegram.forwardMessage(
      admin_id,
      ctx.from.id,
      ctx.wizard.state.message_id
    );

    main_message = await ctx.telegram.sendMessage(
      admin_id,
      ctx.getTitle("NEW_APPOINTMENT", [
        estate_id ?? "Нет",
        date,
        period,
        people_count,
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
    ctx.getTitle("NEW_APPOINTMENT", [
      estate_id ?? "Нет",
      date,
      period,
      people_count,
      contact_name,
      username,
      phone,
      comment ?? "Нет",
    ]),
    { parse_mode: "HTML" }
  );
}

module.exports = [clientScene];
