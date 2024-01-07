import Head from 'next/head';
import { useDropzone } from 'react-dropzone';
import styles from '../styles/Home.module.css';
import React from 'react';
import Script from 'next/script';
import JSZip from 'jszip';
import encode from '../src/encoders/mozJPEG/worker/mozjpegEncode';
import { builtinDecode } from '../src/encoders/utils';
import { defaultOptions } from '../src/encoders/mozJPEG/shared/meta';

export default function Home() {
  const { getRootProps, getInputProps, acceptedFiles } = useDropzone({
    accept: {
      'image/*': ['.jpeg', '.png', '.jpg']
    }
  });
  const [compressing, setCompressing] = React.useState(false);
  const [compressedFilesList, setCompressedFilesList] = React.useState([]);
  const [compressionQuality, setCompressionQuality] = React.useState(75); // Initial value for the slider

  const getFileSize = (bytes) => {
    const kilobytes = bytes / 1024;
    if (kilobytes < 1024) {
      return kilobytes.toFixed(2) + 'kb';
    } else {
      const megabytes = kilobytes / 1024;
      return megabytes.toFixed(2) + 'mb';
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

  interface CompressedFile {
    fileName: String,
    originalFileSize: number,
    compressedFileSize: number,
    compressedFile: ArrayBuffer,
    compressionPercentage: number,
  };

  const compressedFiles: Array<CompressedFile> = [];
  const compressFiles = async () => {
    try {
      setCompressing(true);
      await Promise.all(acceptedFiles.map(async (file, index, files) => {
        const encodedData = await encode(await builtinDecode(file), {...defaultOptions, quality: Math.min(101 - compressionQuality, 100)});
        const compressedData = encodedData.byteLength < file.size ? encodedData : await file.arrayBuffer();

        const compressedFile: CompressedFile = {
          fileName: file.name,
          originalFileSize: file.size,
          compressedFileSize: compressedData.byteLength,
          compressedFile: compressedData,
          compressionPercentage: ((file.size - compressedData.byteLength) / file.size) * 100,
        }

        compressedFiles.push(compressedFile);
      }));

      const sortedFiles = compressedFiles.sort((a, b) => b.compressionPercentage - a.compressionPercentage);
      setCompressedFilesList(sortedFiles);
    } finally {
      setCompressing(false);
    }
  };

  const downloadFiles = () => {
    if (compressedFilesList.length === 1) {
      // Single file, direct download
      download(compressedFilesList[0].compressedFile, compressedFilesList[0].fileName);
    } else if (compressedFilesList.length > 1) {
      // Multiple files, create a zip and download
      const zip = new JSZip();
      compressedFilesList.forEach((f, index) => {
        zip.file(`${f.fileName}`, f.compressedFile);
      });

      zip.generateAsync({ type: 'blob' }).then((content) => {
        download(content, 'compressed_files.zip');
      });
    } else {
      // Handle case when there are no compressed files
      console.error('No compressed files to download.');
    }
  };

  React.useEffect(() => {
    // Reset compressedFilesList when new files are selected
    setCompressedFilesList([]);
  }, [acceptedFiles]);

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

          {/* Compression quality slider */}
          <div>
            <label>Compression Strength (higher value means final image size will be lesser):</label>
            <input
              type="range"
              min="0"
              max="100"
              value={compressionQuality}
              onChange={(e) => setCompressionQuality(Number(e.target.value))}
            />
            <span>{compressionQuality}</span>
          </div>

          {/* Compress selected files */}
          {acceptedFiles.length > 0 && (
            <div>
              <button onClick={compressFiles}>
                {compressing ? 'Compressing...' : 'Compress Files'}
              </button>
            </div>
          )}

          {/* Download button */}
          {(compressedFilesList.length > 0 && acceptedFiles.length > 0) && (
            <div>
              <button onClick={downloadFiles}>Download Compressed Files</button>
            </div>
          )}

          {(compressedFilesList.length > 0 && acceptedFiles.length > 0) &&  (
            <div>
              <h2>Top Compressed Files:</h2>
              <ul>
                {compressedFilesList.sort().slice(0, 5).map((f, index) => (
                  <li key={index}>
                    {`${f.fileName.slice(0, 20)}${f.fileName.length > 10 ? '...' : ''} from ${getFileSize(f.originalFileSize)} -> ${getFileSize(f.compressedFileSize)} (${f.compressionPercentage.toFixed(2)}%)`}
                  </li>
                ))}
              </ul>
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
