export const buildHelloMarkup = (hexColorValue: string) => {
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <title>OpenFeature</title>
  </head>
  <body>
  	<span>Welcome to</span>
    <span style="color: #${hexColorValue};">OpenFeature!</span>
  </body>
</html>
`;
};
