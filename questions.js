// Compatibility Chaos Questions
// Each question has a category for matching algorithm

const questions = [
    {
        id: 1,
        category: "lifestyle",
        question: "It's Friday night. What's your vibe?",
        options: [
            { text: "Wild night out until 4am 🍾", value: "party" },
            { text: "Cozy night in with Netflix & snacks 🛋️", value: "homebody" },
            { text: "Dinner and drinks, home by midnight 🍷", value: "balanced" },
            { text: "Whatever chaos finds me 🎲", value: "spontaneous" }
        ]
    },
    {
        id: 2,
        category: "communication",
        question: "How do you handle conflict?",
        options: [
            { text: "Talk it out immediately, no matter what 💬", value: "direct" },
            { text: "Need space first, then discuss 🧘", value: "processor" },
            { text: "Avoid it until it goes away 🏃", value: "avoider" },
            { text: "Passionate debate, maybe some yelling 🔥", value: "intense" }
        ]
    },
    {
        id: 3,
        category: "romance",
        question: "Your ideal date is:",
        options: [
            { text: "Spontaneous adventure to somewhere new 🗺️", value: "adventurous" },
            { text: "Fancy restaurant, dress to impress 👔", value: "classic" },
            { text: "Something active - hiking, sports, etc 🏃", value: "active" },
            { text: "Low-key, just good conversation 💭", value: "intimate" }
        ]
    },
    {
        id: 4,
        category: "values",
        question: "Money and relationships:",
        options: [
            { text: "Split everything 50/50 always 💰", value: "equal" },
            { text: "Take turns treating each other 🔄", value: "reciprocal" },
            { text: "Whoever makes more pays more 📊", value: "proportional" },
            { text: "Money shouldn't matter in love ❤️", value: "idealist" }
        ]
    },
    {
        id: 5,
        category: "personality",
        question: "At a party, you're the one who:",
        options: [
            { text: "Knows everyone and works the room 🎭", value: "social" },
            { text: "Deep conversation with 2-3 people 🗣️", value: "selective" },
            { text: "Didn't want to come in the first place 😅", value: "introvert" },
            { text: "Started the party (it's at my place) 🎉", value: "host" }
        ]
    },
    {
        id: 6,
        category: "lifestyle",
        question: "Morning routine:",
        options: [
            { text: "Up at 5am, workout, productive ☀️", value: "earlybird" },
            { text: "Snooze until the last possible second ⏰", value: "snoozer" },
            { text: "What's a morning? I'm nocturnal 🌙", value: "nightowl" },
            { text: "Depends on my mood/schedule 🤷", value: "flexible" }
        ]
    },
    {
        id: 7,
        category: "values",
        question: "Your career vs relationship priority:",
        options: [
            { text: "Career first, relationship second 💼", value: "ambitious" },
            { text: "Relationship first, career second 💕", value: "romantic" },
            { text: "Both equally important ⚖️", value: "balanced" },
            { text: "Whatever feels right at the time 🎯", value: "intuitive" }
        ]
    },
    {
        id: 8,
        category: "communication",
        question: "Texting style:",
        options: [
            { text: "Instant replies, always available 📱", value: "constant" },
            { text: "Reply when I can, no rush ⏱️", value: "casual" },
            { text: "Hate texting, just call me ☎️", value: "caller" },
            { text: "Send 47 texts in a row, then ghost 👻", value: "chaotic" }
        ]
    },
    {
        id: 9,
        category: "romance",
        question: "How fast do you catch feelings?",
        options: [
            { text: "Love at first sight is real 😍", value: "fast" },
            { text: "Takes me months to open up 🐢", value: "slow" },
            { text: "Somewhere in between 🚶", value: "moderate" },
            { text: "Bold of you to assume I have feelings 🗿", value: "guarded" }
        ]
    },
    {
        id: 10,
        category: "lifestyle",
        question: "Social media presence:",
        options: [
            { text: "Post everything, influencer vibes 📸", value: "public" },
            { text: "Rarely post, but always scrolling 👀", value: "lurker" },
            { text: "What's Instagram? It's 2010? 🤔", value: "offline" },
            { text: "Only post food and memes 🍕", value: "casual" }
        ]
    },
    {
        id: 11,
        category: "personality",
        question: "When making decisions:",
        options: [
            { text: "Overthink everything for days 🧠", value: "analytical" },
            { text: "Go with my gut instantly 💫", value: "impulsive" },
            { text: "Make a pros/cons list 📝", value: "logical" },
            { text: "Ask everyone's opinion first 🗳️", value: "social" }
        ]
    },
    {
        id: 12,
        category: "values",
        question: "Deal with an ex who wants to be friends:",
        options: [
            { text: "Sure, mature adults can be friends 🤝", value: "mature" },
            { text: "Hard pass, moving on 🚫", value: "boundary" },
            { text: "Depends on how it ended 🤔", value: "situational" },
            { text: "Already friends with all my exes 😬", value: "friendly" }
        ]
    },
    {
        id: 13,
        category: "romance",
        question: "Public displays of affection:",
        options: [
            { text: "Kiss me in public, IDGAF 💋", value: "affectionate" },
            { text: "Hold hands max, keep it classy 🤝", value: "reserved" },
            { text: "Don't touch me outside the house 🚷", value: "private" },
            { text: "Depends on my mood 🎭", value: "variable" }
        ]
    },
    {
        id: 14,
        category: "lifestyle",
        question: "Your living space is:",
        options: [
            { text: "Spotless, everything organized 🧹", value: "clean" },
            { text: "Organized chaos, I know where stuff is 📚", value: "messy" },
            { text: "Minimalist vibes, barely own anything 🏛️", value: "minimal" },
            { text: "Maximalist - more is more 🎨", value: "cluttered" }
        ]
    },
    {
        id: 15,
        category: "personality",
        question: "When life gets stressful:",
        options: [
            { text: "Talk about it with everyone 🗣️", value: "open" },
            { text: "Isolate and deal with it alone 🏝️", value: "alone" },
            { text: "Distract myself with anything else 🎮", value: "avoidant" },
            { text: "Channel it into work/gym/hobbies 💪", value: "productive" }
        ]
    }
];
