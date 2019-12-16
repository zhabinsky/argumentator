const tableLogger = require ('console.table');
const chalk = require ('chalk');

/**
 * @param extpectedArg An array of configurations
 * 	@param extpectedArg[i].flags comma separated flags
 * 	@param extpectedArg[i].description text to be shown when showing --manual
 * 	@param extpectedArg[i].value                an object to be merged with context
 * 	@param extpectedArg[i].action should return an object to be merged with context
 * 
 * @param options An Object
 * 
 */

module.exports = function argumentator (expectedArgs, options = {}) {
  if (!Array.isArray (expectedArgs)) {
    /**
     * Allow for single argument declaration to be passed
     */
    expectedArgs = [expectedArgs];
  }

  expectedArgs.push ({
    flags: `--manual, --man`,
    description: 'Shows all available CLI arguments',
    action: () => {
      /**
	   * --manual flag will output all expected args
	   * and quit the app
	   */
      logTable (expectedArgs);
      process.exit ();
    },
  });

  const context = {}; // initialise empty context object

  /**
   * Trying to retrieve args from options object
   * if not, using process.argv.slice (2)
   */
  const {processArguments = process.argv.slice (2)} = options;

  /**
   * Gather all process args that are not flags
   * and attach them to context as texts:[]
   */
  const flagRegex = /^--/;
  context.texts = processArguments.filter (e => !flagRegex.test (e));

  /**
   * Add booleans to context 
   * ex. flag "--copy" will extend context obj with {copy: true}
   */
  const params = processArguments.filter (e => flagRegex.test (e));
  const unprefix = a => a.replace (/^\-\-/, '');
  params.forEach (param => {
    const [key, val = true] = unprefix (param).split ('=');
    context[key] = val;
  });

  for (let i = 0; i < expectedArgs.length; i++) {
    const extpectedArg = expectedArgs[i];
    /**
	 * If the argument is passed to process
	 * Its value object and result from action()
	 * will be appended to context object
	 */
    const argContext = buildContext (extpectedArg, processArguments);
    Object.assign (context, argContext);
  }

  context.args = processArguments; // attaching process args to context

  return context;
};

function logTable (args) {
  const table = args.map (item => {
    const {flags = '?', description = '?'} = item;
    return {
      [chalk.blue ('Flags:')]: chalk.green (flags.split (',').join (', ')),
      [chalk.blue ('Description:')]: description,
    };
  });
  console.table (table);
}

const lengthMoreThanZero = e => e.trim ().length > 0;

function buildContext (argument, args) {
  const isInArgs = flag => args.indexOf (flag) !== -1;
  const isMentioned = flags => flags.filter (isInArgs).length > 0;

  const {flags, action = () => ({}), value} = argument;

  const context = {};

  const extendContext = (a = {}) => Object.assign (context, a);
  const possibleFlags = flags.split (',').filter (lengthMoreThanZero);

  const hasInArgs = isMentioned (possibleFlags);
  if (!hasInArgs) return context;

  /**
   * Extending context depending with action():Object and value:Object
   * these values come from an individual argument config
   */
  if (isType (action, 'function')) extendContext (action (context));
  if (isType (value, 'object')) extendContext (value);

  return context;
}

function isType (value, type) {
  return value && typeof value === type;
}
