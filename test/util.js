export function deindent(string) {
  const first = (/^ +/m).exec(string)[0];
  const indent = !first ? /^/ : new RegExp(`^ {${first.length}}?`, 'mg');
  return string.trim().replace(indent, '');
}

export function createQueryEngine(variableNames, results) {
  if (!results) {
    results = variableNames;
    variableNames = ['?value'];
  }
  return {
    execute: jest.fn(async function*(query) {
      const regex = new RegExp('FILTER \\(lang\\(\\?result\\) = \'([a-z]*)\'\\)');
      const matches = query.match(regex);

      if (matches && matches.length && matches[1]) {
        const language = matches[1];
        const languageResult = results.filter(result => result.language === language);
        const bindings = variableNames.map((name, i) => [name, languageResult[i]]);
        yield new Map(bindings);
      }
      else {
        for (let result of results) {
          if (!Array.isArray(result))
            result = [result];
          const bindings = variableNames.map((name, i) => [name, result[i]]);
          yield new Map(bindings);
        }
      }
    }),
  };
}
