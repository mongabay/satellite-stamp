import React from 'react';
import Document, { Html, Main, NextScript, Head } from 'next/document';

export default class MyDocument extends Document {
  static async getInitialProps(ctx) {
    const initialProps = await Document.getInitialProps(ctx);
    return { ...initialProps };
  }

  render() {
    return (
      <Html lang="en">
        <Head>
          <meta charSet="utf-8" />
          <meta httpEquiv="x-ua-compatible" content="ie=edge" />
          <meta name="viewport" content="width=1024, initial-scale=1, shrink-to-fit=no" />
          <meta name="author" content="Vizzuality" />
          <link rel="icon" href="/icon.png" type="image/png" sizes="64x64" />
          <link
            href="https://fonts.googleapis.com/css2?family=Cardo:wght@400;700&family=Open+Sans:ital,wght@0,400;0,600;0,700;1,400&display=swap"
            rel="stylesheet"
          />
          <script
            src={`https://maps.googleapis.com/maps/api/js?key=${process.env.GOOGLE_MAPS_API_KEY}&libraries=places`}
          />
        </Head>
        <body id="root">
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}
