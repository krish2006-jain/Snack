export function calculateStreak(timestamps: number[]): number {
    const daySet = new Set<string>();
    timestamps.forEach((t) => {
        daySet.add(new Date(t * 1000).toISOString().split('T')[0]);
    });
    let streak = 0;
    const today = new Date();
    for (let i = 0; i < 60; i++) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        if (daySet.has(d.toISOString().split('T')[0])) streak++;
        else if (i > 0) break;
    }
    return streak;
}
