import Head from 'next/head';
import { useDropzone } from 'react-dropzone';
import styles from '../styles/Home.module.css';
import React from 'react';
import Script from 'next/script';
import Compressor from 'compressorjs';
import encode from '../src/encoders/mozJPEG/worker/mozjpegEncode';
import { builtinDecode } from '../src/encoders/utils';
import { defaultOptions } from '../src/encoders/mozJPEG/shared/meta';

export default function Home() {
  const { getRootProps, getInputProps, acceptedFiles } = useDropzone({
    accept: {
      'image/*': ['.jpeg', '.png', '.jpg']
    }
  });

  const getFileSize = (bytes) => {
    const kilobytes = bytes / 1024;
    if (kilobytes < 1024) {
      return kilobytes.toFixed(2) + ' KB';
    } else {
      const megabytes = kilobytes / 1024;
      return megabytes.toFixed(2) + ' MB';
    }
  };

  const download = (file, name) => {
    const url = URL.createObjectURL(new Blob([file]));
    const dl = document.createElement('a');
    dl.download = name;
    dl.href = url;
    dl.click();
    URL.revokeObjectURL(url);
  }

  const compressFiles = () => {
    const fileDetailsBeforeCompression = acceptedFiles.map((file: File) => ({
      name: file.name,
      size: getFileSize(file.size),
    }));

    const compressedFiles = [];
    acceptedFiles.map(async (file) => {
      const f = await encode(await builtinDecode(file), defaultOptions);
      console.log(file.size, f.byteLength);
      download(f, file.name);
    });
  };

  return (
      <>
      <Head>
        <title>Bulk Image Compressor</title>
        <meta name="description" content="Compress one or more images instantly" />
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
      <div className={styles.heading}>
        <h1>Bulk Image Compressor</h1>
      </div>
      <div className={styles.description}>
        <p>Compress multiple images instantly!<br/> </p>
      </div>
      <div className={styles.container}>
        <main>
          {/* Multifile Picker */}
          <div {...getRootProps()} className={styles.dropzone}>
            <input {...getInputProps()} />
            <p>Drop or select one or more images here.</p>
          </div>

          {/* Compress selected files */}
          {acceptedFiles.length > 0 && (
            <div>
              <button onClick={compressFiles}>Compress Files</button>
            </div>
          )}
        </main>
      </div>
      <div className={styles.footer}>
        <h1>Thanks</h1>
      </div>
    </>
  );
}
