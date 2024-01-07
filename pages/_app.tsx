import React from 'react';
import '../styles/global.css';
import Head from 'next/head';

export default function App({ Component, pageProps }) {
    return (<>
    <Head>
          <link rel="shortcut icon" href="filecompressor/images/favicon.ico" />
    </Head>
    <Component {...pageProps} />;
    </>)
}