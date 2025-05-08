export class PluginSettings {
  public dailyNoteNameFormatSetting = 'YYYY-MM-DD';
  public dayframeTemplateSetting = `## I am Dayframe
{{DAYFRAME}}

## I am also Dayframe
`;
}


// eslint-disable-next-line perfectionist/sort-modules
export class TypedItem {
  public static readonly Bar = new TypedItem('Bar');
  public static readonly Baz = new TypedItem('Baz');
  public static readonly Foo = new TypedItem('Foo');

  public constructor(public readonly name: string) {}

  public static deserialize(name: string): TypedItem {
    const items = [TypedItem.Bar, TypedItem.Baz, TypedItem.Foo];
    const item = items.find((i) => i.name === name);

    if (item === undefined) {
      throw new Error(`Unknown item: ${name}`);
    }

    return item;
  }
}
