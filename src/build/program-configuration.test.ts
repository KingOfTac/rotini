import ProgramConfiguration from './program-configuration';

describe('ProgramConfiguration', () => {
  describe('strict_commands', () => {
    const expectedErrorMessage = 'Program configuration property "strict_commands" must be of type "boolean".';

    it('throws error when "strict_commands" is string', () => {
      expect(() => {
        // @ts-expect-error program configuration property "strict_commands" is string
        new ProgramConfiguration({ strict_commands: 'yes', });
      }).toThrowError(expectedErrorMessage);
    });

    it('throws error when "strict_commands" is number', () => {
      expect(() => {
        // @ts-expect-error program configuration property "strict_commands" is number
        new ProgramConfiguration({ strict_commands: 3, });
      }).toThrowError(expectedErrorMessage);
    });

    it('does not throw when "strict_commands" is boolean', () => {
      expect(() => {
        new ProgramConfiguration({ strict_commands: true, });
      }).not.toThrow();
    });
  });

  describe('strict_flags', () => {
    const expectedErrorMessage = 'Program configuration property "strict_flags" must be of type "boolean".';

    it('throws error when "strict_flags" is string', () => {
      expect(() => {
        // @ts-expect-error program configuration property "strict_flags" is string
        new ProgramConfiguration({ strict_flags: 'nah', });
      }).toThrowError(expectedErrorMessage);
    });

    it('throws error when "strict_flags" is number', () => {
      expect(() => {
        // @ts-expect-error program configuration property "strict_flags" is number
        new ProgramConfiguration({ strict_flags: 123, });
      }).toThrowError(expectedErrorMessage);
    });

    it('does not throw when "strict_flags" is boolean', () => {
      expect(() => {
        new ProgramConfiguration({ strict_flags: false, });
      }).not.toThrow();
    });
  });

  describe('show_deprecation_warnings', () => {
    const expectedErrorMessage = 'Program configuration property "show_deprecation_warnings" must be of type "boolean".';

    it('throws error when "show_deprecation_warnings" is string', () => {
      expect(() => {
        // @ts-expect-error program configuration property "show_deprecation_warnings" is string
        new ProgramConfiguration({ show_deprecation_warnings: 'no', });
      }).toThrowError(expectedErrorMessage);
    });

    it('throws error when "show_deprecation_warnings" is number', () => {
      expect(() => {
        // @ts-expect-error program configuration property "show_deprecation_warnings" is number
        new ProgramConfiguration({ show_deprecation_warnings: 324, });
      }).toThrowError(expectedErrorMessage);
    });

    it('does not throw when "show_deprecation_warnings" is boolean', () => {
      expect(() => {
        new ProgramConfiguration({ show_deprecation_warnings: false, });
      }).not.toThrow();
    });
  });
});
