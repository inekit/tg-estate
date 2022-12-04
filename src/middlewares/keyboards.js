const { Markup } = require("telegraf");
//const store = require('../LocalStorage/store')

exports.custom_bottom_keyboard = (ctx, bNames, columns = 2) => {
  let k = Markup.keyboard([], { columns: 2 }).resize();

  bNames = bNames.reduce((prev, cur, i) => {
    if (i % columns === 0) {
      prev.push([ctx.getTitle(cur)]);
      return prev;
    } else {
      prev[prev.length - 1].push(ctx.getTitle(cur));
      return prev;
    }
  }, []);

  bNames.forEach((name) => {
    k.reply_markup.keyboard.push(name);
  });

  return k;
};

exports.main_menu_admin_keyboard = (ctx) => {
  const buttons = [[ctx.getTitle("ADMIN_SCENE_BUTTON")]];

  return Markup.keyboard(buttons).resize();
};

exports.main_menu_goback_keyboard = (ctx) =>
  Markup.keyboard(
    [ctx.getTitle("BUTTON_GO_BACK"), ctx.getTitle("BUTTON_MAIN_MENU")],
    { columns: 1 }
  ).resize();

exports.main_menu_back_keyboard = (ctx) =>
  Markup.keyboard([ctx.getTitle("BUTTON_BACK_USER")]).resize();

exports.alpinist_back_keyboard = (ctx) =>
  Markup.keyboard([ctx.getTitle("BUTTON_BACK_ALPINIST")]).resize();

exports.admin_back_keyboard = (ctx) =>
  Markup.keyboard([ctx.getTitle("BUTTON_BACK_ADMIN")]).resize();

exports.remove_keyboard = () => Markup.removeKeyboard();
