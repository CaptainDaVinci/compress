import Head from 'next/head';
import styles from '../styles/Home.module.css';
import Footer from './footer';
import Image from 'next/image';

export default function Privacy() {
    return (
        <>
            <Head>
                <title>Privacy</title>
                <meta name="description" content="Compress one or more images instantly - Privacy" />
            </Head>
            <div className={styles.heading}>
                <h1>Privacy</h1>
                <Image src="./images/privacy.svg" alt={''} width={200} height={100}/>
            </div>
            <div className={styles.contentContainer}>
                <div className={styles.privacyContainer}>
                    <h2>Your Data, Your Control</h2>

                    We value your privacy and want you to feel secure while using our file compression service. Here's what you need to know:
                    <ul>
                        <li>
                            <strong>Local Processing Only</strong>: Your files never leave your device; compression happens on your machine.
                        </li>
                        <li>
                            <strong>No Upload Required</strong>: We don't require file uploads – your data stays private.
                        </li>
                        <li>
                            <strong>Take Control</strong>: You don't have to take our word for it. Disconnect from the internet before compressing for added peace of mind.
                        </li>
                    </ul>
                </div>
            </div>
            <Footer/>
      </>
    )
}