import Head from 'next/head';
import { useDropzone } from 'react-dropzone';
import styles from '../styles/Home.module.css';
import React, { useEffect } from 'react';
import JSZip from 'jszip';
import jpegEncode from '../src/encoders/mozJPEG/worker/mozjpegEncode';
import pngEncode from '../src/encoders/oxiPNG/worker/oxipngEncode';
import { blobToArrayBuffer, builtinDecode } from '../src/encoders/utils';
import { defaultOptions } from '../src/encoders/mozJPEG/shared/meta';
import Footer from './footer';
import { ReactCompareSlider, ReactCompareSliderImage } from 'react-compare-slider';
import { canvasEncode } from '../src/encoders/utils/canvas';
import Modal from 'react-modal';

Modal.setAppElement("#root");

export default function Home() {
  const { getRootProps, getInputProps, acceptedFiles } = useDropzone({
    accept: {
      'image/jpeg': [],
      'image/png': [],
      'image/jpg': [],
    }
  });
  const [compressing, setCompressing] = React.useState(false);
  const [compressedFilesList, setCompressedFilesList] = React.useState([]);
  const [compressionQuality, setCompressionQuality] = React.useState(60); // Initial value for the slider
  const [previewIndex, setPreviewIndex] = React.useState(null);
  const [openModel, setOpenModel] = React.useState(false);

  useEffect(() => {
    if (typeof window.gtag !== 'undefined' && compressedFilesList.length > 0) {
      gtag('event', 'conversion', {
        event_category: 'compression',
        event_label: 'success',
        numberOfFiles: compressedFilesList.length,
        originalFileSize: getTotalOriginalFileSize(),
        compressedFileSize: getTotalCompressedFileSize(),
        send_to: 'G-RT43Z6PFC2',
      });
    }
  }, [compressedFilesList]);

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
    originalFile: File,
    compressionPercentage: number,
  };

  const compressedFiles: Array<CompressedFile> = [];
  const compressFiles = async () => {
    try {
      setCompressing(true);
      setCompressedFilesList([]);
      await Promise.all(acceptedFiles.map(async (file, index, files) => {
        let encodedData;
        if (file.type === 'image/png') {
          try {
            encodedData = await pngEncode(
              await blobToArrayBuffer(file), 
              { level: Math.min(Math.floor((compressionQuality / 100) * 4), 3), interlace: false }
            );
          } catch (e) {
            let decodedImage = await builtinDecode(file);
            encodedData = await pngEncode(
              await blobToArrayBuffer(await canvasEncode(decodedImage, "image/png")), 
              { level: Math.min(Math.floor((compressionQuality / 100) * 4), 3), interlace: false }
            );
          }
        } else {
          let decodedImage = await builtinDecode(file);
          encodedData = await jpegEncode(decodedImage, { ...defaultOptions, quality: Math.min(101 - compressionQuality, 100) });
        }

        const compressedData = encodedData.byteLength < file.size ? encodedData : await file.arrayBuffer();

        const compressedFile: CompressedFile = {
          fileName: file.name,
          originalFileSize: file.size,
          compressedFileSize: compressedData.byteLength,
          compressedFile: compressedData,
          originalFile: file,
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

  const getTotalOriginalFileSizeInBytes = () => {
    return compressedFilesList.reduce((totalSize, file) => totalSize + file.originalFileSize, 0);
  }

  const getTotalCompressedFileSizeInBytes = () => {
    return compressedFilesList.reduce((totalSize, file) => totalSize + file.compressedFileSize, 0);
  }

  const getTotalOriginalFileSize = () => {
    return getFileSize(getTotalOriginalFileSizeInBytes());
  };

  const getTotalCompressedFileSize = () => {
    return getFileSize(getTotalCompressedFileSizeInBytes());
  };

  const getPercentageSavedFromCompression = () => {
    const original = getTotalOriginalFileSizeInBytes();
    const compressed = getTotalCompressedFileSizeInBytes();

    return (original - compressed) / original * 100;
  }

  React.useEffect(() => {
    // Reset compressedFilesList when new files are selected
    setCompressedFilesList([]);
  }, [acceptedFiles]);

  return (
      <>
      <Head>
        <title>Bulk Image Compressor</title>
        <meta name="description" content="Bulk compress your images instantly for free and reduce the size of your images to few kbs. Supported image formats - JPG, JPEG, PNG and many more. No sign-up or upload required, complete privacy." />
        <meta name="keywords" content='compression,bulk,images,png,jpg,jpeg,privacy,free,lossless'/>
        <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
        <meta name="robots" content="index, follow"/>
        <meta name="author" content="CaptainDaVinci"/>
        <link rel="canonical" href="https://compress.captaindavinci.com" />
      </Head>
      <div className={styles.heading}>
        <h1>Bulk Image Compressor</h1>
      </div>
      <div id="root" className={styles.landingImages}>
        <div className={styles.landingImageGroup}>
        <div dangerouslySetInnerHTML={{ __html: `
       <svg height="100px" width="100px" version="1.1" id="_x32_" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="-51.2 -51.2 614.40 614.40" xml:space="preserve" fill="#49416D">

       <g id="SVGRepo_bgCarrier" stroke-width="0">
       
       <path transform="translate(-51.2, -51.2), scale(19.2)" d="M16,28.922750930700985C18.63033392342492,29.108338664873212,21.28854884979572,30.361183551969397,23.758722188749484,29.438501032726112C26.325378778962566,28.479779176512878,28.539660819336813,26.376786191814087,29.59031063749537,23.84636950492859C30.611161597712332,21.387721285597486,29.804409993795463,18.621071169277116,29.338498333735124,16C28.9361185085064,13.736338775318071,28.27085076769351,11.568984942159307,27.060461276942107,9.614239704396045C25.875459276821427,7.700494555272316,24.346106456787048,6.043384566895079,22.435959103384192,4.85259183750315C20.484762813253155,3.6362090533344986,18.290434230302395,2.5174525309107767,16,2.7191083686692377C13.756432736535071,2.916637915728856,12.24396442674874,5.014409566349902,10.186688846775468,5.931049722408277C7.827039113408368,6.982415772193803,4.66529263273118,6.515288402918005,3.0165651866440086,8.50401041550295C1.374308449532877,10.484927353084007,1.5037615957977906,13.448811921862838,1.8391397318669718,15.999999999999998C2.1532594084102814,18.389477093820705,3.6614136282260494,20.340920313852035,4.848373591718081,22.438394508723693C6.045555996771631,24.553932756337947,6.747286510636706,27.164609821423298,8.848653494247362,28.386495490493708C10.950985056822248,29.608942035042922,13.574123424571384,28.751589036385656,16,28.922750930700985" fill="#A882DD" strokewidth="0"/>
       
       </g>
       
       <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"/>
       
       <g id="SVGRepo_iconCarrier"> <style type="text/css"> .st0{fill:#49416D;} </style> <g> <path class="st0" d="M259.993,460.958c14.498,14.498,75.487-23.002,89.985-37.492l59.598-59.606l-52.494-52.485l-59.597,59.597 C282.996,385.462,245.504,446.46,259.993,460.958z"/> <path class="st0" d="M493.251,227.7c-14.498-14.49-37.996-14.49-52.485,0l-71.68,71.678l52.494,52.486l71.671-71.68 C507.741,265.695,507.741,242.198,493.251,227.7z M399.586,308.882l-9.008-8.999l50.18-50.18l8.991,8.99L399.586,308.882z"/> <path class="st0" d="M374.714,448.193c-14.071,14.055-67.572,51.008-104.791,51.008c-0.008,0,0,0-0.008,0 c-17.47,0-28.484-7.351-34.648-13.516c-44.758-44.775,36.604-138.56,37.492-139.439l4.123-4.124 c-3.944-4.354-5.644-10.348-5.644-22.302c0-8.836,0-25.256,0-40.403c11.364-12.619,15.497-11.048,25.103-60.596 c19.433,0,18.178-25.248,27.34-47.644c7.479-18.238,1.212-25.632-5.072-28.655c5.14-66.463,5.14-112.236-70.296-126.435 c-27.349-23.438-68.606-15.48-88.158-11.57c-19.536,3.911-37.159,0-37.159,0l3.355,31.49 C97.74,70.339,112.05,116.112,107.44,142.923c-5.994,3.27-11.407,10.809-4.269,28.254c9.17,22.396,7.906,47.644,27.339,47.644 c9.614,49.548,13.747,47.976,25.111,60.596c0,15.148,0,31.567,0,40.403c0,25.248-8.58,25.684-28.134,36.612 c-47.14,26.35-108.572,41.659-119.571,124.01C5.902,495.504,92.378,511.948,213.434,512 c121.04-0.052,207.524-16.496,205.518-31.558c-3.168-23.702-10.648-41.547-20.68-55.806L374.714,448.193z"/> </g> </g>
       
       </svg> 
        ` }} />
          <label>No sign-ups</label>
        </div>
        <div className={styles.landingImageGroup}>
          <div dangerouslySetInnerHTML={{ __html: `
          <svg width="100px" height="100px" viewBox="-3.36 -3.36 30.72 30.72" fill="none" xmlns="http://www.w3.org/2000/svg" transform="rotate(0)" stroke="#49416D" stroke-width="0.12000000000000002">

          <g id="SVGRepo_bgCarrier" stroke-width="0" transform="translate(0,0), scale(1)">
          
          <path transform="translate(-3.36, -3.36), scale(0.96)" d="M16,31.621714061746996C18.462372505189418,31.79814434009271,20.627374384355154,30.12637100278683,22.776938852510643,28.912378171393925C24.87657560716102,27.726582627024033,27.10497078658197,26.59493594872493,28.44745797777439,24.591859885263904C29.78395721886068,22.597718223267183,30.533577874103127,20.11870483687087,30.269729678949396,17.73265887766359C30.01900523371215,15.465294308107756,27.75522446969797,13.979499510591376,27.03461065090471,11.815124182031003C26.27257504727176,9.526337848805058,27.684935588221393,6.444608641614078,25.95253884449307,4.765905969106047C24.243564173131983,3.1098994230026022,21.33961615133947,4.010950361893871,18.960005796190565,3.9907844064416604C17.000228410508914,3.9741763162262216,15.096544083936022,4.147130854417236,13.204416599411061,4.657872288408107C11.342497977877809,5.160459452599608,9.414137674726476,5.6579893290392995,7.985235491825231,6.953201034716173C6.561893228657011,8.243373016045915,6.084178275787754,10.197630770891406,5.207219496742029,11.906838259578421C4.228561194929216,13.814259837756113,2.649166579954623,15.500054723666803,2.5026378840873402,17.63887647638311C2.3488210025170657,19.884081009804113,3.0895724263510154,22.17693675874884,4.3771760450991035,24.022656117410136C5.662603898292427,25.865256618260016,7.8338580015816,26.747000859730857,9.71428354800964,27.976432084256345C11.77141893885969,29.321397051038282,13.548493676396244,31.44606235099724,16,31.621714061746996" fill="#A882DD" strokewidth="0"/>
          
          </g>
          
          <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round" stroke="#CCCCCC" stroke-width="0.096"/>
          
          <g id="SVGRepo_iconCarrier"> <path d="M12.5535 2.49392C12.4114 2.33852 12.2106 2.25 12 2.25C11.7894 2.25 11.5886 2.33852 11.4465 2.49392L7.44648 6.86892C7.16698 7.17462 7.18822 7.64902 7.49392 7.92852C7.79963 8.20802 8.27402 8.18678 8.55352 7.88108L11.25 4.9318V16C11.25 16.4142 11.5858 16.75 12 16.75C12.4142 16.75 12.75 16.4142 12.75 16V4.9318L15.4465 7.88108C15.726 8.18678 16.2004 8.20802 16.5061 7.92852C16.8118 7.64902 16.833 7.17462 16.5535 6.86892L12.5535 2.49392Z" fill="#1C274C"/> <path d="M3.75 15C3.75 14.5858 3.41422 14.25 3 14.25C2.58579 14.25 2.25 14.5858 2.25 15V15.0549C2.24998 16.4225 2.24996 17.5248 2.36652 18.3918C2.48754 19.2919 2.74643 20.0497 3.34835 20.6516C3.95027 21.2536 4.70814 21.5125 5.60825 21.6335C6.47522 21.75 7.57754 21.75 8.94513 21.75H15.0549C16.4225 21.75 17.5248 21.75 18.3918 21.6335C19.2919 21.5125 20.0497 21.2536 20.6517 20.6516C21.2536 20.0497 21.5125 19.2919 21.6335 18.3918C21.75 17.5248 21.75 16.4225 21.75 15.0549V15C21.75 14.5858 21.4142 14.25 21 14.25C20.5858 14.25 20.25 14.5858 20.25 15C20.25 16.4354 20.2484 17.4365 20.1469 18.1919C20.0482 18.9257 19.8678 19.3142 19.591 19.591C19.3142 19.8678 18.9257 20.0482 18.1919 20.1469C17.4365 20.2484 16.4354 20.25 15 20.25H9C7.56459 20.25 6.56347 20.2484 5.80812 20.1469C5.07435 20.0482 4.68577 19.8678 4.40901 19.591C4.13225 19.3142 3.9518 18.9257 3.85315 18.1919C3.75159 17.4365 3.75 16.4354 3.75 15Z" fill="#1C274C"/> </g>
          
          </svg>
          ` }} />
          <label>No uploads</label>
        </div>
        <div className={styles.landingImageGroup}>
          <div dangerouslySetInnerHTML={{ __html: `
          <svg width="100px" height="100px" viewBox="-5 -5 30.00 30.00" xmlns="http://www.w3.org/2000/svg" fill="#49416D">

          <g id="SVGRepo_bgCarrier" stroke-width="0" transform="translate(0,0), scale(1)">
          
          <path transform="translate(-5, -5), scale(0.9375)" d="M16,29.49796832973758C18.53983524517747,29.801278734026425,21.44514844024512,30.523970382249615,23.529034512117505,29.040670306927076C25.62559415788946,27.54834924270616,25.118149474013645,24.234606327715113,26.470477376632637,22.045132931942742C27.881392759743015,19.76080404319948,31.769116065159388,18.678511789698995,31.583602500458557,16C31.393012200110558,13.248188469087701,27.29587847126054,12.644597627303295,25.665302998409057,10.419734712069236C24.28096181767361,8.530849832877779,24.51651783234031,5.7684663639975025,22.866840082531176,4.106284089605547C21.03375486696511,2.2593041245084864,18.59282257622056,0.9020930751345027,16.000000000000004,0.681168908874195C13.334497927833871,0.45405200995517936,10.541922344781618,1.2430860300683904,8.422593476871654,2.8755469123378585C6.386907768031145,4.4435797639614805,5.669041783922412,7.0857594026923465,4.632701444886756,9.437087119246517C3.694569165193351,11.56559292756993,2.2431737685909825,13.707683208396135,2.638031815489134,15.999999999999998C3.0255127232789145,18.249489400887224,5.516126848205148,19.41746934015479,6.6891479822559035,21.375622918829315C7.836837630689263,23.29149001367592,7.759267718330998,25.89027564258253,9.442221844568842,27.358404949972062C11.204945602850412,28.896121498521207,13.677322843497464,29.22059122478209,16,29.49796832973758" fill="#A882DD" strokewidth="0"/>
          
          </g>
          
          <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"/>
          
          <g id="SVGRepo_iconCarrier"> <rect x="0" fill="none" width="20" height="20"/> <g> <path d="M10 9.6c-.6 0-1 .4-1 1 0 .4.3.7.6.8l-.3 1.4h1.3l-.3-1.4c.4-.1.6-.4.6-.8.1-.6-.3-1-.9-1zm.1-4.3c-.7 0-1.4.5-1.4 1.2V8h2.7V6.5c-.1-.7-.6-1.2-1.3-1.2zM10 2L3 5v3c.1 4.4 2.9 8.3 7 9.9 4.1-1.6 6.9-5.5 7-9.9V5l-7-3zm4 11c0 .6-.4 1-1 1H7c-.6 0-1-.4-1-1V9c0-.6.4-1 1-1h.3V6.5C7.4 5.1 8.6 4 10 4c1.4 0 2.6 1.1 2.7 2.5V8h.3c.6 0 1 .4 1 1v4z"/> </g> </g>
          
          </svg>
          ` }} />
          <label>Complete privacy</label>
        </div>
      </div>
      <div className={styles.container}>
          {/* <div>
            <h1>Privacy focused</h1>
          </div> */}

          {/* Multifile Picker */}
          <div {...getRootProps()} className={styles.dropzone}>
            <input {...getInputProps()} />
            <p>Drop images(s), or</p> 
            <p>Select from your device by clicking here.</p>
            <p>(.png, .jpeg, .jpg)</p>
          </div>

          {/* Compress selected files */}
          {acceptedFiles.length > 0 && (
            <>
            {/* Compression quality slider */}
              <div className={styles.settings}>
                <label className={styles.sliderLabel}>Compression Strength [{compressionQuality}] </label>
                <br />
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={compressionQuality}
                  onChange={(e) => setCompressionQuality(Number(e.target.value))}
                  className={styles.slider}
                />
              </div>
              <button onClick={compressFiles} className={styles.compressBtn} disabled={compressing}>
                {compressing ? 'Compressing...' : 'Compress Files'}
              </button>
            </>
          )}

          {compressedFilesList.length > 0 && (
            <div className={styles.resultContainer}>
              {/* Download button */}
              {acceptedFiles.length > 0 && (
                <>
                  <p>Compression completed! 🎉</p>
                  <p>
                    You saved <span className={styles.compressPercent}>{getPercentageSavedFromCompression().toFixed(2)}% </span> 
                    ({getTotalOriginalFileSize()} → {getTotalCompressedFileSize()})
                  </p>
                  <button onClick={downloadFiles} className={styles.downloadBtn}>↓ Download Compressed File(s) ↓</button>
                </>
              )}

              {/* Top compressed section */}
              {(acceptedFiles.length > 0 && compressedFilesList.length > 0) &&  (
                <div>
                  <h4>Top Compressed Files</h4>
                  <ul>
                    {compressedFilesList.map((f, index) => (
                      <li key={index}>
                        <span className={styles.fileName}>
                          {f.fileName.slice(0, 20)}{f.fileName.length > 10 ? '...' : ''}
                        </span>
                        {`  ${getFileSize(f.originalFileSize)} → ${getFileSize(f.compressedFileSize)} `}

                        {f.originalFileSize > f.compressedFileSize &&
                        (
                          <span className={styles.compressPercent}>({f.compressionPercentage.toFixed(2)}% ↓)</span>
                        ) }
                         <button onClick={() => { setPreviewIndex(index); setOpenModel(true) }}> Preview </button>
                         { previewIndex != null && (
                            <Modal isOpen={openModel} style={{ width: '50%', height: '50%' }}>
                              <div style={{ margin: 'auto', padding: 'auto'}}>
                                <ReactCompareSlider
                                  itemOne={
                                    <img
                                      src={URL.createObjectURL(compressedFilesList[previewIndex].originalFile)}
                                      alt={`Original - ${compressedFilesList[previewIndex].fileName}`}
                                      style={{ maxWidth: '100%', maxHeight: '100%' }}
                                    />
                                  }
                                  itemTwo={
                                    <img
                                      src={URL.createObjectURL(new Blob([compressedFilesList[previewIndex].compressedFile]))}
                                      alt={`Compressed - ${compressedFilesList[previewIndex].fileName}`}
                                      style={{ maxWidth: '100%', maxHeight: '100%' }}
                                    />
                                  }
                                  style={{ width: '100%', height: '60%' }}
                                />
                                <button onClick={() => setOpenModel(false)}>Close</button>
                              </div>
                            </Modal>
                         )
                        }
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
      </div>
      <Footer/>
    </>
  )
}
