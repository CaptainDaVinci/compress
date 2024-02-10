import Link from 'next/link';
import styles from '../styles/Home.module.css';
export default function Footer() {
        return (
            <div className={styles.footer}>
                <ul>
                    <li><Link href='/'>Home</Link></li>
                </ul>
                <ul>
                    <li><Link href='/privacy'>Privacy</Link></li>
                </ul>
                <ul>
                    <li><a href='https://blogs.captaindavinci.com/2024/01/14/bulk-image-compression.html' style={{'textDecoration': 'none'}} target='_blank'>Blog</a></li>
                </ul>
                <ul>
                    <li>Made by <a href='https://twitter.com/CaptainDaVinci' style={{'textDecoration': 'underline'}} target='_blank'>@CaptainDaVinci</a></li>
                </ul>
          </div>
        )
}