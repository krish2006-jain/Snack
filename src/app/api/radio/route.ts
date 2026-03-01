import { NextResponse } from 'next/server';
import { mockRadioSongs, type RadioSong } from '@/lib/mock-data/patient';

// In a real app we'd attach a DB here.
// For the demo we keep an in-memory array that initializes from the mock data.
let inMemoryRadioSongs = [...mockRadioSongs];

export async function GET() {
    return NextResponse.json({ songs: inMemoryRadioSongs });
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const newSong: RadioSong = {
            id: `song-${Date.now()}`,
            title: body.title,
            artist: body.artist,
            era: body.era || 'Unknown',
            addedBy: body.addedBy || 'Guardian',
            coverColor: body.coverColor || '#6D28D9',
            youtubeUrl: body.youtubeUrl,
        };

        // Add to the beginning of the playlist
        inMemoryRadioSongs = [newSong, ...inMemoryRadioSongs];
        return NextResponse.json({ success: true, song: newSong });
    } catch (error) {
        console.error('Error adding song:', error);
        return NextResponse.json({ success: false, error: 'Failed to add song' }, { status: 500 });
    }
}
