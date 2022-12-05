const { Markup } = require("telegraf");

const callbackButton = Markup.button.callback;
const urlButton = Markup.button.url;
const { inlineKeyboard } = Markup;

exports.confirm_keyboard = (ctx) =>
  inlineKeyboard([callbackButton(ctx.getTitle("BUTTON_CONFIRM"), "confirm")]);

exports.new_appointment_keyboard = (ctx) => {
  const keyboard = inlineKeyboard(
    [
      callbackButton(ctx.getTitle("MAKE_ORDER_BUTTON"), "new_appointment"),
      callbackButton(ctx.getTitle("SELECTION_BUTTON"), "selection"),
    ],
    { columns: 1 }
  );
  return keyboard;
};

exports.infrastructure_keyboard = (
  ctx,
  selected = {
    рестораны: false,
    бары: false,
    супермаркеты: false,
    школы: false,
    "детские сады": false,
  }
) => {
  const keyboard = inlineKeyboard(
    Object.entries(selected).map(([name, selected]) =>
      callbackButton(
        `${selected ? "✅" : ""} ${
          name.length < 25 ? name : name.substr(0, 25) + ".."
        }`,
        "toogle_" + name
      )
    ),
    { columns: 1 }
  );

  keyboard.reply_markup.inline_keyboard.push([
    callbackButton(ctx.getTitle("CONFIRM"), "confirm"),
  ]);

  return keyboard;
};

exports.udobstva_keyboard = (
  ctx,
  selected = {
    балкон: false,
    парковка: false,
    бассейн: false,
    интернет: true,
  }
) => {
  const keyboard = inlineKeyboard(
    Object.entries(selected).map(([name, selected]) =>
      callbackButton(
        `${selected ? "✅" : ""} ${
          name.length < 25 ? name : name.substr(0, 25) + ".."
        }`,
        "toogle_" + name
      )
    ),
    { columns: 1 }
  );

  keyboard.reply_markup.inline_keyboard.push([
    callbackButton(ctx.getTitle("CONFIRM"), "confirm"),
  ]);

  return keyboard;
};

exports.custom_keyboard = (ctx, bNames, bLinks) => {
  let k = inlineKeyboard([]);

  if (bNames.length != bLinks.length) return k;

  bNames.forEach((name, id) => {
    k.reply_markup.inline_keyboard.push([
      callbackButton(ctx.getTitle(name), bLinks[id]),
    ]);
  });

  return k;
};

exports.custom_obj_keyboard = (ctx, bNamesObj) => {
  let k = inlineKeyboard([], { columns: 3 }).resize();

  Object.entries(bNamesObj)?.forEach(([name, link], i) => {
    // console.log(name, link)
    if (i % 2 === 0)
      k.reply_markup.inline_keyboard.push([
        callbackButton(ctx.getTitle(name), link),
      ]);
    else
      k.reply_markup.inline_keyboard[
        k.reply_markup.inline_keyboard.length - 1
      ].push(callbackButton(ctx.getTitle(name), link));
  });

  return k.resize();
};

exports.dictionary_keyboard = (dictionary, tag) => {
  let k = inlineKeyboard([], { columns: 2 });

  dictionary.forEach((type_name, id) => {
    k.reply_markup.inline_keyboard.push([
      callbackButton(type_name, `${tag}-${id}`),
    ]);
  });

  return k;
};

exports.skip_keyboard = (ctx) => this.custom_keyboard(ctx, ["SKIP"], ["skip"]);

exports.skip_previous_keyboard = (ctx) =>
  inlineKeyboard(
    [
      callbackButton(ctx.getTitle("BUTTON_PREVIOUS"), "previous_step"),
      callbackButton(ctx.getTitle("BUTTON_SKIP"), "skip"),
    ],
    { columns: 2 }
  );

exports.confirm_cancel_keyboard = (ctx) =>
  inlineKeyboard(
    [
      callbackButton(ctx.getTitle("BUTTON_CONFIRM"), "confirm"),
      callbackButton(ctx.getTitle("BUTTON_CANCEL"), "cancel"),
    ],
    { columns: 1 }
  );

exports.go_back_keyboard = (ctx) =>
  inlineKeyboard([callbackButton(ctx.getTitle("BUTTON_GO_BACK"), "go_back")]);

exports.skip_keyboard = (ctx) =>
  inlineKeyboard([callbackButton(ctx.getTitle("BUTTON_SKIP"), "skip")]);

exports.cancel_keyboard = (ctx) =>
  inlineKeyboard([callbackButton(ctx.getTitle("BUTTON_CANCEL"), "cancel")]);

exports.confirm_keyboard = (ctx) =>
  inlineKeyboard([callbackButton(ctx.getTitle("BUTTON_CONFIRM"), "confirm")]);
