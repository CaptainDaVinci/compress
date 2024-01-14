import styles from '../styles/Home.module.css';
import Link from 'next/link';
import Footer from './footer';
import Head from 'next/head';

export default function TOS() {
    return (
        <>
            <Head>
                <title>Terms of Service</title>
                <meta name="description" content="Compress one or more images instantly - Terms of Service" />
            </Head>
            <div className={styles.heading}>
                <h1>Terms of Service</h1>
            </div>
            <div className={styles.contentContainer}>
                <p>Thank you for using our service. By accessing and using our services, you agree to the following terms:</p>
                <ol>
                    <li><strong>Donation-Based Model:</strong> Your contribution is considered a donation to support the maintenance and upkeep of our website. We deeply appreciate your generosity.</li>
                    <li><strong>Non-Refundable:</strong> All contributions made are non-refundable. As it is a free-to-use service, contributions are voluntary and considered a goodwill gesture towards sustaining our platform.</li>
                </ol>
                <p>Your support is vital for running the service smoothly and providing free services to all users.</p>
            </div>
            <Footer/>
      </>
    )
}