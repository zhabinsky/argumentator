require ('console.table');
const chalk = require ('chalk');

const argumentator = userArguments => {
  const argumentDeclarations = [
    ...toArray (userArguments),
    {
      flags: `--manual`,
      description: 'Shows all available CLI arguments',
      action: () => table (argumentDeclarations) || process.exit (),
    },
  ];
  const context = {};
  const args = process.argv.slice (2);

  const paramRegex = /\-\-.*\=.*/;
  const flagRegex = /^--/;

  const extendContextFromConfig = argumentDeclaration => {
    const contains = c => {
      const arr = Array.isArray (c)
        ? c.map (e => contains (e)).filter (e => !!e)
        : args.filter (e => !paramRegex.test (e)).filter (e => e === c);
      return arr.length > 0;
    };
    const {flags, action = () => ({}), value} = argumentDeclaration;
    if (contains (flags.split (','))) {
      const hasAction = action && typeof action === 'function';
      const hasValue = value && typeof value === 'object';
      if (hasAction) Object.assign (context, action (context) || {});
      if (hasValue) Object.assign (context, value);
    }
  };
  const extendContextWithValues = () => {
    const params = args.filter (e => flagRegex.test (e));
    params
      .map (uprefixArgument)
      .map (param => param.split ('='))
      .map (([key, val = true]) => {
        context[key] = val;
      });
  };
  const collectTexts = () => {
    context.texts = args.filter(e => !flagRegex.test(e));
  }

  collectTexts();
  extendContextWithValues ();
  argumentDeclarations.forEach (argumentDeclaration =>
    extendContextFromConfig (argumentDeclaration)
  );
  context.args = args;
  return context;
};

module.exports = argumentator;

function table (userArguments) {
  const table = userArguments.map (item => {
    const {flags = '?', description = '?'} = item;
    return {
      [chalk.blue ('Flags:')]: chalk.green (flags.split (',').join (', ')),
      [chalk.blue ('Description:')]: description,
    };
  });
  console.table (table);
}

function toArray (a) {
  if (Array.isArray (a)) return a;
  return [a];
}

function uprefixArgument (a) {
  return a.replace (/^\-\-/, '');
}
