'use client'

import { useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'

export default function ChatRedirectPage() {
    const params = useParams()
    const router = useRouter()
    const token = params.token as string

    useEffect(() => {
        // Chat is now integrated into the main scan page
        router.replace(`/scan/${token}?tab=chat`)
    }, [token, router])

    return (
        <div style={{
            display: 'flex', justifyContent: 'center', alignItems: 'center',
            height: '100vh', background: 'var(--bg-base, #F6F1EB)'
        }}>
            <p style={{ color: 'var(--text-muted, #888)', fontSize: 14 }}>
                Redirecting to chat…
            </p>
        </div>
    )
}
