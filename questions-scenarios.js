// Compatibility Chaos - Scenario-Based Questions
// These questions present real-life situations instead of direct questions

const questions = [
    {
        id: 1,
        category: "lifestyle",
        question: "It's 11 PM on a Tuesday. Your partner texts: 'Let's go get tacos!' You:",
        options: [
            { text: "🌮 Already grabbing my keys - LET'S GO!", value: "spontaneous" },
            { text: "😴 'Are you insane? I have work tomorrow!'", value: "scheduled" },
            { text: "🤔 'Only if we're back by midnight'", value: "compromise" },
            { text: "📱 'DoorDash exists for a reason'", value: "practical" }
        ]
    },
    {
        id: 2,
        category: "communication",
        question: "Your partner cancels your anniversary dinner last minute for a work emergency. You:",
        options: [
            { text: "💬 Call them immediately to talk it through", value: "direct" },
            { text: "😤 Send a long text explaining why this hurts", value: "expressive" },
            { text: "🤐 Say 'it's fine' but feel upset inside", value: "avoider" },
            { text: "✅ Understand completely - work comes first", value: "understanding" }
        ]
    },
    {
        id: 3,
        category: "romance",
        question: "It's your first date. They suggest skydiving. You think:",
        options: [
            { text: "🪂 'HELL YES! This is going to be epic!'", value: "adventurous" },
            { text: "💀 'Absolutely not. Coffee shop or I'm out'", value: "traditional" },
            { text: "🤔 'How about we start with mini golf?'", value: "moderate" },
            { text: "😅 'I'll try anything once... I guess?'", value: "flexible" }
        ]
    },
    {
        id: 4,
        category: "values",
        question: "The check arrives. It's $200. Your date reaches for it. You:",
        options: [
            { text: "✋ Grab it first - 'I got this!'", value: "generous" },
            { text: "💳 'Let's split it 50/50'", value: "equal" },
            { text: "🤝 'I'll get next time!'", value: "reciprocal" },
            { text: "😊 Let them pay and say thanks", value: "traditional" }
        ]
    },
    {
        id: 5,
        category: "personality",
        question: "At a party, someone spills wine on your white shirt. You:",
        options: [
            { text: "😂 Laugh it off and make a joke about it", value: "easygoing" },
            { text: "😠 Visibly annoyed but stay polite", value: "controlled" },
            { text: "💢 Need to leave and calm down", value: "sensitive" },
            { text: "🤷 Don't even notice until later", value: "carefree" }
        ]
    },
    {
        id: 6,
        category: "lifestyle",
        question: "Your partner wants to adopt a dog. You live in a small apartment. You say:",
        options: [
            { text: "🐕 'YES! I'll make it work somehow!'", value: "adaptable" },
            { text: "📋 'Let's make a pros/cons list first'", value: "analytical" },
            { text: "❌ 'No way. Not until we have a house'", value: "practical" },
            { text: "😬 'Maybe a small dog...?'", value: "compromiser" }
        ]
    },
    {
        id: 7,
        category: "communication",
        question: "You notice your partner seems off. They say 'I'm fine.' You:",
        options: [
            { text: "🔍 Keep asking until they tell you what's wrong", value: "persistent" },
            { text: "⏰ Give them space, check in later", value: "respectful" },
            { text: "✅ Take their word for it and move on", value: "trusting" },
            { text: "🎭 Make jokes to lighten the mood", value: "deflector" }
        ]
    },
    {
        id: 8,
        category: "romance",
        question: "Your partner posts a couple photo on Instagram. You:",
        options: [
            { text: "📸 Love it! Post it to my story too", value: "public" },
            { text: "❤️ Like it but don't share it", value: "moderate" },
            { text: "😬 Prefer to keep our relationship private", value: "private" },
            { text: "🤳 Ask them to take it down (too much)", value: "reserved" }
        ]
    },
    {
        id: 9,
        category: "values",
        question: "You get a huge promotion that requires moving across the country. Your partner has roots here. You:",
        options: [
            { text: "💼 Take it - they can come or not", value: "independent" },
            { text: "🗣️ Have a serious discussion about it", value: "collaborative" },
            { text: "❤️ Turn it down - relationship comes first", value: "committed" },
            { text: "⚖️ See if there's a compromise", value: "flexible" }
        ]
    },
    {
        id: 10,
        category: "personality",
        question: "Plans fall through last minute. Your weekend is suddenly free. You:",
        options: [
            { text: "🎉 Make new plans immediately!", value: "social" },
            { text: "😌 Finally, time to do nothing", value: "homebody" },
            { text: "😰 Feel anxious without a plan", value: "planner" },
            { text: "🎲 See what happens, go with the flow", value: "spontaneous" }
        ]
    },
    {
        id: 11,
        category: "lifestyle",
        question: "It's cleaning day. Your approaches are VERY different. The tension is real. You:",
        options: [
            { text: "📝 Make a cleaning schedule to avoid conflict", value: "organized" },
            { text: "🧹 Just do it yourself to avoid the argument", value: "avoider" },
            { text: "💬 Have a direct conversation about expectations", value: "communicator" },
            { text: "🤷 Whatever, house gets cleaned eventually", value: "relaxed" }
        ]
    },
    {
        id: 12,
        category: "communication",
        question: "Your ex texts you 'hey' out of nowhere. You:",
        options: [
            { text: "📱 Tell your partner immediately", value: "transparent" },
            { text: "🗑️ Delete and don't mention it", value: "protective" },
            { text: "💬 Reply politely but brief, tell partner later", value: "casual" },
            { text: "❓ Ask your partner how they'd want you to handle it", value: "considerate" }
        ]
    },
    {
        id: 13,
        category: "romance",
        question: "Valentine's Day is coming. Your ideal celebration is:",
        options: [
            { text: "🌹 Fancy dinner, flowers, the whole romantic thing", value: "romantic" },
            { text: "🏠 Homemade dinner and Netflix", value: "intimate" },
            { text: "🙄 It's a made-up holiday, let's skip it", value: "practical" },
            { text: "🎊 Big gesture - surprise trip or event!", value: "extravagant" }
        ]
    },
    {
        id: 14,
        category: "values",
        question: "Your partner's best friend clearly doesn't like you. You:",
        options: [
            { text: "😤 Confront them about it directly", value: "direct" },
            { text: "😊 Keep being nice, they'll come around", value: "patient" },
            { text: "🗣️ Talk to your partner about it", value: "communicative" },
            { text: "🤷 Don't care - not trying to impress them", value: "independent" }
        ]
    },
    {
        id: 15,
        category: "personality",
        question: "You're fighting about something stupid. You realize you're wrong. You:",
        options: [
            { text: "🙏 Apologize immediately - 'You're right, I'm sorry'", value: "humble" },
            { text: "😤 Still argue your point even though you know...", value: "stubborn" },
            { text: "😅 Make a joke to diffuse it", value: "deflector" },
            { text: "⏰ Take a break, apologize later when calm", value: "thoughtful" }
        ]
    }
];
