import GuardianSidebar from '@/components/guardian/GuardianSidebar';
import styles from './layout.module.css';

export default function GuardianLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className={styles.shell}>
            <GuardianSidebar />
            <div className={styles.main}>
                {children}
            </div>
        </div>
    );
}
