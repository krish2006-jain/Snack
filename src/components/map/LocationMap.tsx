'use client'

import { useEffect, useRef, useState } from 'react'
import L from 'leaflet'

interface Props {
    samaritanLocation: { lat: number; lng: number } | null
    patientLocation: { lat: number; lng: number }
    patientName: string
    onDetectLocation?: () => void
    locationLoading?: boolean
}

/* ── Custom SVG icon factories ──────────────────────────── */
function svgIcon(color: string, label: string) {
    const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 56" width="40" height="56">
      <defs>
        <filter id="shadow-${color}" x="-20%" y="-10%" width="140%" height="130%">
          <feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="rgba(0,0,0,0.3)"/>
        </filter>
      </defs>
      <path d="M20 0 C8.96 0 0 8.96 0 20 C0 35 20 56 20 56 S40 35 40 20 C40 8.96 31.04 0 20 0Z"
            fill="${color}" filter="url(#shadow-${color})" />
      <circle cx="20" cy="20" r="10" fill="white" opacity="0.9"/>
      <text x="20" y="24" text-anchor="middle" font-size="12" font-weight="bold" fill="${color}">${label}</text>
    </svg>`
    return L.divIcon({
        html: svg,
        className: 'custom-leaflet-marker',
        iconSize: [40, 56],
        iconAnchor: [20, 56],
        popupAnchor: [0, -48],
    })
}

const patientIcon = svgIcon('#2D5A3D', 'P')    // green — patient
const samaritanIcon = svgIcon('#2563EB', 'Y')   // blue — you (samaritan)

/* ── Distance helper (Haversine) ─────────────────────────── */
function haversineKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
    const R = 6371
    const dLat = ((b.lat - a.lat) * Math.PI) / 180
    const dLng = ((b.lng - a.lng) * Math.PI) / 180
    const x =
        Math.sin(dLat / 2) ** 2 +
        Math.cos((a.lat * Math.PI) / 180) *
        Math.cos((b.lat * Math.PI) / 180) *
        Math.sin(dLng / 2) ** 2
    return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x))
}

export default function LocationMap({
    samaritanLocation,
    patientLocation,
    patientName,
    onDetectLocation,
    locationLoading,
}: Props) {
    const mapRef = useRef<HTMLDivElement>(null)
    const leafletMap = useRef<L.Map | null>(null)
    const markersRef = useRef<L.Marker[]>([])
    const lineRef = useRef<L.Polyline | null>(null)
    const [cssLoaded, setCssLoaded] = useState(false)

    /* inject Leaflet CSS once */
    useEffect(() => {
        if (typeof document === 'undefined') return
        const existing = document.querySelector('link[href*="leaflet.css"]')
        if (!existing) {
            const link = document.createElement('link')
            link.rel = 'stylesheet'
            link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
            link.crossOrigin = ''
            document.head.appendChild(link)
            link.onload = () => setCssLoaded(true)
        } else {
            setCssLoaded(true)
        }
    }, [])

    /* initialise / update map */
    useEffect(() => {
        if (!cssLoaded || !mapRef.current) return

        // create map if needed
        if (!leafletMap.current) {
            leafletMap.current = L.map(mapRef.current, {
                zoomControl: true,
                attributionControl: true,
            }).setView([patientLocation.lat, patientLocation.lng], 14)

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; OpenStreetMap contributors',
                maxZoom: 19,
            }).addTo(leafletMap.current)
        }

        const map = leafletMap.current

        // clear old markers & line
        markersRef.current.forEach((m) => m.remove())
        markersRef.current = []
        if (lineRef.current) { lineRef.current.remove(); lineRef.current = null }

        // patient marker
        const pm = L.marker([patientLocation.lat, patientLocation.lng], { icon: patientIcon })
            .addTo(map)
            .bindPopup(
                `<div style="text-align:center;font-family:Inter,system-ui,sans-serif">
                    <strong style="color:#2D5A3D">${patientName}'s Home</strong><br/>
                    <span style="font-size:12px;color:#666">Expected location</span>
                </div>`
            )
        markersRef.current.push(pm)

        // samaritan marker
        if (samaritanLocation) {
            const sm = L.marker([samaritanLocation.lat, samaritanLocation.lng], { icon: samaritanIcon })
                .addTo(map)
                .bindPopup(
                    `<div style="text-align:center;font-family:Inter,system-ui,sans-serif">
                        <strong style="color:#2563EB">Your Location</strong><br/>
                        <span style="font-size:12px;color:#666">Good Samaritan</span>
                    </div>`
                )
            markersRef.current.push(sm)

            // dashed line between points
            lineRef.current = L.polyline(
                [
                    [patientLocation.lat, patientLocation.lng],
                    [samaritanLocation.lat, samaritanLocation.lng],
                ],
                { color: '#2D5A3D', weight: 2, dashArray: '8, 8', opacity: 0.6 }
            ).addTo(map)

            // fit bounds to both
            const group = L.featureGroup(markersRef.current)
            map.fitBounds(group.getBounds().pad(0.3))
        } else {
            map.setView([patientLocation.lat, patientLocation.lng], 14)
        }

        // invalidate size in case container was hidden
        setTimeout(() => map.invalidateSize(), 200)
    }, [cssLoaded, samaritanLocation, patientLocation, patientName])

    /* cleanup on unmount */
    useEffect(() => {
        return () => {
            if (leafletMap.current) {
                leafletMap.current.remove()
                leafletMap.current = null
            }
        }
    }, [])

    const distance =
        samaritanLocation ? haversineKm(samaritanLocation, patientLocation) : null

    return (
        <div className="location-map-wrapper">
            {/* ── Inline styles (scoped) ── */}
            <style>{`
                .custom-leaflet-marker { background: none !important; border: none !important; }
                .location-map-wrapper {
                    display: flex; flex-direction: column; gap: 12px;
                    padding: 16px; animation: fadeIn 0.3s ease both;
                }
                .location-map-container {
                    width: 100%; height: 340px;
                    border-radius: 16px; overflow: hidden;
                    border: 1.5px solid var(--border-subtle, #e5e5e5);
                    box-shadow: 0 4px 24px rgba(0,0,0,0.08);
                }
                .location-map-container .leaflet-container {
                    width: 100%; height: 100%; font-family: inherit;
                }
                .map-legend {
                    display: flex; gap: 16px; justify-content: center;
                    padding: 10px 16px; background: var(--bg-surface-soft, #f5f5f5);
                    border-radius: 12px; font-size: 13px; color: var(--text-body, #444);
                }
                .map-legend-item { display: flex; align-items: center; gap: 6px; }
                .map-legend-dot {
                    width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0;
                }
                .map-legend-dot--patient { background: #2D5A3D; }
                .map-legend-dot--samaritan { background: #2563EB; }
                .map-distance-card {
                    display: flex; align-items: center; justify-content: center; gap: 10px;
                    padding: 14px 20px; border-radius: 12px;
                    background: linear-gradient(135deg, rgba(45,90,61,0.08), rgba(37,99,235,0.08));
                    border: 1px solid var(--border-subtle, #e5e5e5);
                    font-size: 14px; font-weight: 600; color: var(--text-heading, #1a1a1a);
                }
                .map-distance-value {
                    font-size: 20px; font-weight: 800; color: #2D5A3D;
                }
                .map-detect-btn {
                    display: flex; align-items: center; justify-content: center; gap: 8px;
                    width: 100%; padding: 14px 20px;
                    background: linear-gradient(135deg, #2563EB, #1d4ed8);
                    color: #fff; border: none; border-radius: 12px;
                    font-size: 15px; font-weight: 600; cursor: pointer;
                    transition: all 0.2s ease;
                }
                .map-detect-btn:hover { transform: translateY(-1px); box-shadow: 0 4px 16px rgba(37,99,235,0.3); }
                .map-detect-btn:disabled { opacity: 0.7; cursor: not-allowed; transform: none; }
                .map-info-text {
                    text-align: center; font-size: 12px; color: var(--text-muted, #888);
                    line-height: 1.5;
                }
            `}</style>

            {/* Map */}
            <div className="location-map-container">
                <div ref={mapRef} style={{ width: '100%', height: '100%' }} />
            </div>

            {/* Legend */}
            <div className="map-legend">
                <div className="map-legend-item">
                    <span className="map-legend-dot map-legend-dot--patient" />
                    <span>{patientName}&apos;s Home</span>
                </div>
                <div className="map-legend-item">
                    <span className="map-legend-dot map-legend-dot--samaritan" />
                    <span>Your Location</span>
                </div>
            </div>

            {/* Distance or Detect */}
            {distance !== null ? (
                <div className="map-distance-card">
                    <span>Distance:</span>
                    <span className="map-distance-value">
                        {distance < 1
                            ? `${Math.round(distance * 1000)} m`
                            : `${distance.toFixed(1)} km`}
                    </span>
                    <span>away</span>
                </div>
            ) : (
                <>
                    {onDetectLocation && (
                        <button
                            type="button"
                            className="map-detect-btn"
                            onClick={onDetectLocation}
                            disabled={locationLoading}
                        >
                            📍 {locationLoading ? 'Detecting…' : 'Share Your Location'}
                        </button>
                    )}
                    <p className="map-info-text">
                        Share your location so {patientName}&apos;s family can see where you are.
                        Your location is only shared with their care team.
                    </p>
                </>
            )}
        </div>
    )
}
