'use client'

import { useState, useEffect } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import ScanClient from './ScanClient'
import type { QRProfile } from '@/types'

type TabId = 'card' | 'info' | 'chat'

export default function ScanPage() {
    const params = useParams()
    const searchParams = useSearchParams()
    const token = params.token as string
    const tabParam = searchParams.get('tab') as TabId | null
    const defaultTab: TabId = (tabParam === 'info' || tabParam === 'chat') ? tabParam : 'card'

    const [profile, setProfile] = useState<QRProfile | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchProfile() {
            try {
                const res = await fetch(`/api/scan/${token}`)
                if (res.ok) {
                    const data = await res.json()
                    setProfile({
                        token,
                        patient: {
                            id: 'patient-ravi-001',
                            name: data.patient.name,
                            age: data.patient.age,
                            photo: data.patient.photo || '',
                            bloodType: data.patient.bloodType,
                            allergies: data.patient.allergies,
                            conditions: data.patient.conditions,
                            medications: data.patient.medications,
                            careStage: data.patient.careStage,
                            guardianId: 'guardian-priya-001',
                            caretakerId: 'caretaker-anita-001',
                            qrToken: token,
                            address: data.patient.address,
                            language: data.patient.language || 'en',
                        },
                        emergencyContacts: data.emergencyContacts.map((c: { name: string; relation: string; phone: string }, i: number) => ({
                            id: `ec-${i}`,
                            name: c.name,
                            relation: c.relation,
                            phone: c.phone,
                            isPrimary: i === 0,
                        })),
                        careInstructions: data.careInstructions,
                    })
                } else {
                    // Fallback to mock data if API fails
                    const { mockQRProfiles } = await import('@/lib/mock-data')
                    setProfile(mockQRProfiles[token] ?? null)
                }
            } catch {
                // Fallback to mock data
                const { mockQRProfiles } = await import('@/lib/mock-data')
                setProfile(mockQRProfiles[token] ?? null)
            } finally {
                setLoading(false)
            }
        }

        fetchProfile()
    }, [token])

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: 'var(--bg-primary, #F7F3EE)' }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{
                        width: 40, height: 40, border: '3px solid #e0e0e0',
                        borderTopColor: 'var(--color-primary, #2D5A3D)',
                        borderRadius: '50%', animation: 'spin 0.8s linear infinite',
                        margin: '0 auto 16px'
                    }} />
                    <p style={{ color: 'var(--text-secondary, #666)', fontSize: 14 }}>Loading patient information...</p>
                </div>
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        )
    }

    return <ScanClient profile={profile} token={token} defaultTab={defaultTab} />
}
