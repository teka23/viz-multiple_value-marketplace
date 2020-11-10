import { createGlobalStyle } from 'styled-components'
import roboto from "./roboto-v20-latin-regular.woff2"

export default createGlobalStyle`
  @font-face {
    font-family: "Roboto";
    src: url(${roboto}) format("woff2");
  }
`
