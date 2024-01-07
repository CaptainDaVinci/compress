import Head from 'next/head';
import { useDropzone } from 'react-dropzone';
import styles from '../styles/Home.module.css';
import React from 'react';
import Script from 'next/script';

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

  const compressFiles = async () => {
    const fileDetailsBeforeCompression = acceptedFiles.map((file: File) => ({
      name: file.name,
      size: getFileSize(file.size),
    }));

    const compressedFiles = [];
    acceptedFiles.map(async (file, index, files) => {
      console.log(acceptedFiles);
    });
  };

  return (
      <>
      <Head>
        <title>Bulk File Compressor</title>
        <meta name="description" content="Compress one or multiple files (pdf, jpeg, png, jpg, doc, docx, etc)" />
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
        <h1>Bulk File Compressor</h1>
      </div>
      <div className={styles.description}>
        <p>
          Compress multiple files - images or PDFs, at once! <br/>
          Supported file types: PDF, JPEG, PNG, JPG, doc, docx and many more...
        </p>
      </div>
      <div className={styles.container}>
        <main>
          {/* Multifile Picker */}
          <div {...getRootProps()} className={styles.dropzone}>
            <input {...getInputProps()} />
            <p>Drag 'n' drop some files here, or click to select files</p>
          </div>

          {/* Display selected files */}
          {acceptedFiles.length > 0 && (
            <div>
              <h4>Selected Files:</h4>
              <ul>
                {acceptedFiles.map((file) => (
                  <li key={file.name}>{file.name}</li>
                ))}
              </ul>
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
