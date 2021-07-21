/**
 * Resolves a specific language of a path
 */
export default class LanguageResolver {
  /**
   * The language may be prefixed @ or $.
   */
  supports(property) {
    return typeof property === 'string' && (/^[@$]/).test(property);
  }

  /**
   * We fetch all the translations and return the selected one.
   *
   * Example usage: tomato.label['@nl']
   * Example usage: tomato.label.@nl
   */
  async resolve(property, pathData) {
    const values = pathData.parent.proxy[pathData.property];
    const language = property.substr(1);
    for await (const path of values) {
      if (path.language === language)
        return path;
    }
    return undefined;
  }
}
