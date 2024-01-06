import Head from 'next/head';
import { useDropzone } from 'react-dropzone';
import styles from '../styles/Home.module.css';

export default function Home() {
  const { getRootProps, getInputProps, acceptedFiles } = useDropzone();

  return (
      <>
      <Head>
        <title>Bulk File Compressor</title>
        <meta name="description" content="Compress one or multiple files (pdf, jpeg, png, jpg, doc, docx, etc)" />
      </Head>
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
