import type { Metadata } from 'next'
import { mockQRProfiles } from '@/lib/mock-data'
import ScanClient from './ScanClient'

interface Props {
    params: { token: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const profile = mockQRProfiles[params.token]
    if (!profile) return { title: 'Patient Not Found — SaathiCare' }
    return {
        title: `Help ${profile.patient.name} — SaathiCare`,
        description: `Emergency information for ${profile.patient.name}. Call their family or chat in real-time.`,
        robots: 'noindex',
    }
}

export default function ScanPage({ params }: Props) {
    const profile = mockQRProfiles[params.token]
    return <ScanClient profile={profile ?? null} token={params.token} />
}
