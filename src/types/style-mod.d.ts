// types/style-mod.d.ts
declare module 'style-mod' {
  export interface StyleModule {
    [name: string]: string;
  }

  export interface StyleSpec {
    [selector: string]: {
      [property: string]: string;
    };
  }

  export function StyleModule(spec: StyleSpec): StyleModule;
}