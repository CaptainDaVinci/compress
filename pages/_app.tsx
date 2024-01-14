import React from 'react';
import '../styles/global.css';
import Head from 'next/head';
import Script from 'next/script';

export default function App({ Component, pageProps }) {
    return (<>
    <Head>
          <link rel="shortcut icon" href="./images/favicon.ico" />
    </Head>
    <Script src="https://www.googletagmanager.com/gtag/js?id=G-RT43Z6PFC2" />
    <Script id="google-analytics">
        {`
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());

        gtag('config', 'G-RT43Z6PFC2');
        `}
    </Script>
    <Component {...pageProps} />
    </>)
}