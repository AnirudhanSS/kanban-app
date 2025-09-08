import 'styled-components';

declare module 'styled-components' {
  export interface DefaultTheme {
    title: string,

    colors: {
      primary: string,
      primary_hover: string,
      feature: string,
      bug: string,
      bug_hover: string,
      deploy: string,
      infra: string,
      refactor: string,
      text: string,
      text_primary: string,
      text_secondary: string,
      text_tertiary: string,
      placeholder: string,
      background: string,
      components_background: string,
      border: string,
      switch: string,
      scrollbar_background: string,
      scrollbar_thumb: string,
      scrollbar_thumb_hover: string,
    }
  }
}