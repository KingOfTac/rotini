import { Command, Program, createCommandHelp, } from '../build';
import Utils, { ParseError, } from '../utils';

type T_Result = {
  id: number
  name: string
  variant: 'value' | 'variadic'
  type: 'string' | 'number' | 'boolean'
  allowed_values: (string | number | boolean)[]
  values: (string | number | boolean)[]
}

type T_ParseCommandArgumentsReturn = {
  original_parameters: readonly { id: number, parameter: string, }[]
  parsed_parameters: (string | number | boolean)[]
  unparsed_parameters: { id: number, parameter: string, }[]
  results: T_Result[]
}

export const parseCommandArguments = (commandString: string, program: Program, command: Command, parameters: { id: number, parameter: string, }[] = []): T_ParseCommandArgumentsReturn => {
  const ORIGINAL_PARAMETERS: readonly { id: number, parameter: string, }[] = Object.freeze(parameters);
  const PARSED_PARAMETERS: string[] = [];
  let UNPARSED_PARAMETERS: { id: number, parameter: string, }[] = [];
  const RESULTS: T_Result[] = [];

  command.arguments.forEach((arg, index) => {
    const parameter = parameters[index]?.parameter;

    const values: (string | number | boolean)[] = [];
    const result = {
      id: RESULTS.length + 1,
      name: arg.name,
      variant: arg.variant,
      type: arg.type,
      allowed_values: arg.values,
      values,
    };

    if (!parameter) {
      throw new ParseError(`Expected argument "${arg.name}" for command "${command.name}".`, createCommandHelp({ commandString, command, program, }));
    }

    let typedParameter: string | number | boolean;
    try {
      typedParameter = Utils.getTypedValue({ value: parameter, coerceTo: arg.type, additionalErrorInfo: `for command "${command.name}" argument "${arg.name}"`, }) as never;
    } catch (error) {
      throw new ParseError((error as Error).message, createCommandHelp({ commandString, command, program, }));
    }

    if (arg.variant === 'variadic') {
      const commands = command.commands;

      const nextPossibleCommandNames = commands.map(command => command.name);
      const nextPossibleCommandAliases = commands.map(command => command.aliases).flat();
      const nextPossibleCommandsIdentifiers = [ ...nextPossibleCommandNames, ...nextPossibleCommandAliases, ];

      for (let p = index; p < parameters.length; p++) {
        const parameter = parameters[p].parameter;

        if ((nextPossibleCommandsIdentifiers.includes(parameter) || parameter.startsWith('-')) && result.values.length > 0) {
          UNPARSED_PARAMETERS = parameters.slice(p);
          break;
        }

        let typedParameter;
        try {
          typedParameter = Utils.getTypedValue({ value: parameter, coerceTo: arg.type, additionalErrorInfo: `for command "${command.name}" argument "${arg.name}"`, }) as never;
        } catch (error) {
          throw new ParseError((error as Error).message, createCommandHelp({ commandString, command, program, }));
        }

        const helpFlag = command.flags.find(flag => flag.name === 'help');
        if (parameter === `-${helpFlag?.short_key}` || parameter === `--${helpFlag?.long_key}`) {
          console.info(createCommandHelp({ commandString, command, program, }));
          process.exit(0);
        }

        if (parameter.startsWith('-')) {
          throw new ParseError(`Expected argument "${arg.name}" for command "${command.name}" but found flag "${parameter}".`, createCommandHelp({ commandString, command, program, }));
        }

        if (arg.values.length > 0 && !arg.values.includes(typedParameter)) {
          throw new ParseError(`Expected argument "${arg.name}" value to be one of ${JSON.stringify(arg.values)}.`, createCommandHelp({ commandString, command, program, }));
        }

        try {
          arg.isValid(typedParameter);
        } catch (e) {
          throw new ParseError((e as Error).message, createCommandHelp({ commandString, command, program, }));
        }

        result.values.push(typedParameter);
        PARSED_PARAMETERS.push(parameter);
      }
    } else {
      const helpFlag = command.flags.find(flag => flag.name === 'help');
      if (parameter === `-${helpFlag?.short_key}` || parameter === `--${helpFlag?.long_key}`) {
        console.info(createCommandHelp({ commandString, command, program, }));
        process.exit(0);
      }

      if (parameter.startsWith('-')) {
        throw new ParseError(`Expected argument "${arg.name}" for command "${command.name}" but found flag "${parameter}".`, createCommandHelp({ commandString, command, program, }));
      }

      if (arg.values.length > 0 && !arg.values.includes(typedParameter)) {
        throw new ParseError(`Expected argument "${arg.name}" value to be one of ${JSON.stringify(arg.values)}.`, createCommandHelp({ commandString, command, program, }));
      }

      try {
        arg.isValid(typedParameter);
      } catch (e) {
        throw new ParseError((e as Error).message, createCommandHelp({ commandString, command, program, }));
      }

      result.values.push(typedParameter);
      PARSED_PARAMETERS.push(parameter);
    }

    RESULTS.push(result);
  });

  if (PARSED_PARAMETERS.length + UNPARSED_PARAMETERS.length !== ORIGINAL_PARAMETERS.length) {
    UNPARSED_PARAMETERS = ORIGINAL_PARAMETERS.slice(PARSED_PARAMETERS.length + UNPARSED_PARAMETERS.length);
  }

  return {
    original_parameters: ORIGINAL_PARAMETERS,
    parsed_parameters: PARSED_PARAMETERS,
    unparsed_parameters: UNPARSED_PARAMETERS,
    results: RESULTS,
  };
};

type T_ParsedArgumentsReturn = {
  results: { [key: string]: string | number | boolean | (string | number | boolean)[] }
  parsed_parameters: (string | number | boolean)[]
  unparsed_parameters: { id: number, parameter: string, }[]
}

export const parseArguments = (commandString: string, program: Program, command: Command, parameters: { id: number, parameter: string, }[] = []): T_ParsedArgumentsReturn => {
  const { results, parsed_parameters, unparsed_parameters, } = parseCommandArguments(commandString, program, command, parameters);
  const mappedResults: { [key: string]: string | number | boolean | (string | number | boolean)[] } = {};
  results.map((result: T_Result) => {
    mappedResults[result.name] = (result.variant === 'variadic') ? result.values : result.values[0];
  });

  return {
    results: mappedResults,
    parsed_parameters,
    unparsed_parameters,
  };
};
