import "react";
/** Allow CSS custom properties in style={{ "--c": "#fff" }}. */
declare module "react" {
  interface CSSProperties { [key: `--${string}`]: string | number | undefined }
}
