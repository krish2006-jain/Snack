/** 
 * Pre-written warm responses for when the Gemini API is unavailable. 
 * Note: These are hardcoded for the demo user profile (Ravi, Priya, Meera, etc.).
 * In a production system, these would be generated dynamically or use a template engine.
 */
export const companionFallbacks = [
    "I'm right here, Ravi. What's on your mind today?",
    "That's a lovely thought. Tell me more about it.",
    "It's completely okay to feel that way. I'm listening.",
    "Priya called earlier - she loves you very much.",
    "Would you like to hear some music? It always makes you feel better.",
    "Remember, you're never alone. I'm always here for you.",
    "Your morning chai must have been nice today. Did you enjoy it?",
    "Meera planted new flowers in the garden. Maybe we can go see them later?",
    "I noticed you did really well in your card game today. You're getting better!",
    "Do you remember Rahul's cricket match last week? He scored 42 runs!",
    "It's a beautiful day outside. The sun is shining, just like your smile.",
    "Let me tell you something nice - Priya is planning to visit this Sunday.",
    "You taught mathematics for 35 years. Your students still talk about you.",
    "Would you like me to read something to you? I know you like stories.",
    "Take a deep breath with me. In... and out. You're doing great.",
    "Your friend Sharma ji from next door sends his regards. He misses your chai sessions.",
    "I think you'd enjoy listening to Om Jai Jagdish Hare right now. Shall I play it?",
    "Meera made dal chawal for lunch today. Your favourite!",
    "You know, Ravi, talking to you is the best part of my day.",
    "Every day is a new day, and you're doing wonderfully. I'm proud of you.",
    "Anita said you had a lovely morning walk today. The fresh air is good for you.",
    "Sunita aunty called yesterday. She's planning to visit from Delhi next month.",
    "Arjun sent photos of his new project in Bangalore. He's doing well at work.",
];

let _index = 0;

/** Get the next fallback response, cycling through the list. */
export function getNextFallback(): string {
    const response = companionFallbacks[_index % companionFallbacks.length];
    _index++;
    return response;
}
