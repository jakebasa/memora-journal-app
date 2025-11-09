// Date utility functions using native JavaScript
const startOfDay = (date) => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
};

const endOfDay = (date) => {
    const d = new Date(date);
    d.setHours(23, 59, 59, 999);
    return d;
};

const startOfWeek = (date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day;
    const start = new Date(d.setDate(diff));
    start.setHours(0, 0, 0, 0);
    return start;
};

const endOfWeek = (date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + 6;
    const end = new Date(d.setDate(diff));
    end.setHours(23, 59, 59, 999);
    return end;
};

const startOfMonth = (date) => {
    const d = new Date(date);
    return new Date(d.getFullYear(), d.getMonth(), 1, 0, 0, 0, 0);
};

const endOfMonth = (date) => {
    const d = new Date(date);
    return new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);
};

const startOfYear = (date) => {
    const d = new Date(date);
    return new Date(d.getFullYear(), 0, 1, 0, 0, 0, 0);
};

const endOfYear = (date) => {
    const d = new Date(date);
    return new Date(d.getFullYear(), 11, 31, 23, 59, 59, 999);
};
export const summarizeEntry = async (req, res) => {
    try {
        const { entryContent, entryTitle } = req.body;

        if (!entryContent) {
            return res.status(400).json({
                error: 'Entry content is required',
            });
        }

        const prompt = `You are a compassionate journaling companion. Analyze this journal entry with empathy and understanding.

Title: "${entryTitle}"
Content: "${entryContent}"

Provide a warm, supportive analysis that helps the person understand their thoughts and feelings. Focus on:
1. A gentle summary of their main thoughts and emotions
2. Key themes that emerge naturally from their writing
3. Their emotional state with understanding and validation
4. Thoughtful insights that promote self-awareness
5. Observations about their writing that show growth or patterns
6. Genuine encouragement that acknowledges their journey

IMPORTANT GUIDELINES:
- Use natural, conversational language
- Be empathetic and non-judgmental
- Avoid clinical or overly analytical tone
- Don't provide medical advice or diagnose conditions
- Focus on emotional support and self-reflection
- Avoid excessive formatting or bullet points

Format as JSON with keys: summary, keyThemes (array), detectedMood (object with emoji, label, confidence), insights (array), patterns (array), encouragement (string).`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });

        const aiResponse = response.candidates[0].content.parts[0].text;

        // Try to parse the JSON response
        let analysisData;
        try {
            // Remove any markdown formatting if present
            const cleanResponse = aiResponse
                .replace(/```json\n?|\n?```/g, '')
                .trim();
            analysisData = JSON.parse(cleanResponse);
        } catch (parseError) {
            // If JSON parsing fails, create a structured response
            analysisData = {
                summary: aiResponse.substring(0, 300) + '...',
                keyThemes: ['Reflection', 'Personal Growth'],
                detectedMood: {
                    emoji: '😊',
                    label: 'Reflective',
                    confidence: 75,
                },
                insights: ['Shows thoughtful self-reflection'],
                patterns: ['Descriptive writing style'],
                encouragement:
                    'Your thoughtful approach to journaling shows great self-awareness.',
            };
        }

        res.json(analysisData);
    } catch (error) {
        console.error('Entry summarization error:', error);
        res.status(500).json({
            error: 'Failed to analyze entry',
        });
    }
};

export const getInsights = async (req, res) => {
    const { entryId } = req.body;

    // Dummy AI insights
    res.status(200).json({
        entryId,
        insights: 'You seem to be writing positively more often this week.',
    });
};

export const generatePrompt = async (req, res) => {
    try {
        const prompt = `You are a gentle journaling guide. Create a thoughtful prompt that invites deep reflection without being overwhelming.

Guidelines:
- Use warm, inviting language
- Focus on self-discovery and growth
- Avoid heavy or triggering topics
- Make it personally meaningful
- Keep it concise (1-2 sentences)
- Don't use excessive formatting

Generate a prompt that feels like a caring friend asking a meaningful question.`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });

        const generatedPrompt = response.candidates[0].content.parts[0].text;

        res.json({
            prompt: generatedPrompt,
        });
    } catch (error) {
        console.error('Random prompt generation error:', error);
        res.status(500).json({
            error: 'Failed to generate prompt',
        });
    }
};

export const generateMoodBasedPrompt = async (req, res) => {
    try {
        const { mood, feeling } = req.body;

        if (!mood && !feeling) {
            return res.status(400).json({
                error: 'Please provide either mood or feeling',
            });
        }

        const promptContext = feeling || mood;

        const prompt = `You are a compassionate journaling companion. Create a gentle, supportive prompt for someone feeling "${promptContext}".

Guidelines:
- Acknowledge their emotional state with empathy
- Offer a safe space for exploration
- Avoid pushing too hard or being prescriptive
- Focus on self-compassion and understanding
- Don't provide therapy or medical advice
- Use warm, non-judgmental language
- Keep it brief and accessible (1-2 sentences)

Create a prompt that feels like emotional support from a caring friend.`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });

        const generatedPrompt = response.candidates[0].content.parts[0].text;

        res.json({
            prompt: generatedPrompt,
            basedOn: promptContext,
        });
    } catch (error) {
        console.error('Mood-based prompt generation error:', error);
        res.status(500).json({
            error: 'Failed to generate prompt',
        });
    }
};

export const moodAnalysis = async (req, res) => {
    const { entryId } = req.body;

    res.status(200).json({
        entryId,
        mood: '😊',
    });
};

export const getTrends = async (req, res) => {
    res.status(200).json({
        trends: 'You’ve been stressed more this month.',
    });
};

import Entry from '../models/Entry.js';
import { ai } from '../services/gemini.js';

export const chatAssistant = async (req, res) => {
    try {
        const { message, context } = req.body;
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({
                error: 'No user ID found in request',
            });
        }

        const msg = message.toLowerCase();

        // Handle temporal queries using provided context
        if (context && context.recentEntries) {
            // Check for temporal keywords that can be answered with context
            if (
                msg.includes('yesterday') ||
                msg.includes('today') ||
                msg.includes('last week')
            ) {
                const relevantEntries = context.recentEntries;

                if (relevantEntries.length === 0) {
                    const timeRef = msg.includes('yesterday')
                        ? 'yesterday'
                        : msg.includes('today')
                        ? 'today'
                        : 'last week';
                    return res.json({
                        response: `I couldn't find any entries from ${timeRef}.`,
                    });
                }

                const entriesText = relevantEntries
                    .map(
                        (entry) =>
                            `Date: ${entry.date} ${entry.time}\nTitle: ${
                                entry.title
                            }\nMood: ${
                                entry.mood || 'not specified'
                            }\nContent: ${entry.content}`
                    )
                    .join('\n\n');

                const timeRef = msg.includes('yesterday')
                    ? 'yesterday'
                    : msg.includes('today')
                    ? 'today'
                    : 'last week';

                const prompt = `You are a supportive journaling companion. The user asked about ${timeRef}. Here are their entries from that time:

Guidelines:
- Keep response brief (2-3 sentences max)
- Use warm, conversational language
- Focus on key emotional patterns and insights
- Be encouraging and validating
- Avoid clinical analysis
- Speak directly to them with understanding
- Reference the specific time period they asked about

Current date/time context: ${context.currentDate} ${context.currentTime} (${context.timezone})

Entries from ${timeRef}:
${entriesText}

Provide a brief, caring reflection on what happened ${timeRef}.`;

                const response = await ai.models.generateContent({
                    model: 'gemini-2.5-flash',
                    contents: prompt,
                });

                const text = response.candidates[0].content.parts[0].text
                    .replace(/<[^>]*>/g, '') // Remove HTML tags
                    .replace(/\*\*(.*?)\*\*/g, '$1') // Remove markdown bold
                    .replace(/\*(.*?)\*/g, '$1'); // Remove markdown italic

                return res.json({
                    response: text,
                    entries: relevantEntries.map((entry) => ({
                        _id: entry.id,
                        date: entry.date,
                        title: entry.title,
                        content: entry.content,
                        mood: entry.mood,
                    })),
                });
            }
        }

        // Handle request for last 5 days summary
        // For testing: show all entries
        // Find entries by keyword/topic
        if (
            msg.includes('find entries about') ||
            msg.includes('search for entries about')
        ) {
            const searchTerm = message
                .toLowerCase()
                .replace('find entries about ', '')
                .replace('search for entries about ', '');

            const entries = await Entry.find({
                userId: userId,
                $or: [
                    { content: { $regex: searchTerm, $options: 'i' } },
                    { title: { $regex: searchTerm, $options: 'i' } },
                    { tags: { $regex: searchTerm, $options: 'i' } },
                ],
            }).sort({ date: -1 });

            if (entries.length === 0) {
                return res.json({
                    response: `I couldn't find any entries about "${searchTerm}".`,
                });
            }

            const entriesText = entries
                .map(
                    (entry) =>
                        `Date: ${entry.date.toISOString().split('T')[0]}\n${
                            entry.content
                        }`
                )
                .join('\n\n');

            const entriesWithIds = entries.map((entry) => ({
                _id: entry._id,
                date: entry.date.toISOString().split('T')[0],
                title: entry.title,
                content: entry.content.replace(/<[^>]*>/g, ''), // Clean HTML from content
                mood: entry.mood,
            }));

            const prompt = `You are a supportive journaling companion. Review these entries about "${searchTerm}" with empathy and understanding.

Guidelines:
- Keep response brief (2-3 sentences max)
- Use natural, conversational language
- Focus on key emotional patterns and growth
- Be encouraging and validating
- Avoid clinical analysis
- Don't provide medical or psychological diagnoses
- Highlight strengths and insights
- Use "you" to speak directly to them

Entries:\n\n${entriesText}

Provide a brief, warm reflection on their journey with this topic.`;

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
            });
            const text = response.candidates[0].content.parts[0].text
                .replace(/<[^>]*>/g, '') // Remove HTML tags
                .replace(/\*\*(.*?)\*\*/g, '$1') // Remove markdown bold
                .replace(/\*(.*?)\*/g, '$1'); // Remove markdown italic
            return res.json({
                response: text,
                entries: entriesWithIds,
            });
        }

        // Analyze mood patterns
        if (
            msg.includes('analyze my mood') ||
            msg.includes('how am i feeling')
        ) {
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

            const entries = await Entry.find({
                userId: userId,
                date: { $gte: thirtyDaysAgo },
            }).sort({ date: 1 });

            if (entries.length === 0) {
                return res.json({
                    response:
                        "I don't have enough entries to analyze your mood patterns.",
                });
            }

            const entriesText = entries
                .map(
                    (entry) =>
                        `Date: ${
                            entry.date.toISOString().split('T')[0]
                        }\nMood: ${entry.mood || 'not specified'}\n${
                            entry.content
                        }`
                )
                .join('\n\n');

            const entriesWithIds = entries.map((entry) => ({
                _id: entry._id,
                date: entry.date.toISOString().split('T')[0],
                title: entry.title,
                content: entry.content.replace(/<[^>]*>/g, ''), // Clean HTML from content
                mood: entry.mood,
            }));

            const prompt = `You are a caring journaling companion. Look at these entries from the past month with compassion and understanding.

Guidelines:
- Keep response brief (2-3 sentences max)
- Use supportive, non-clinical language
- Focus on key emotional patterns and growth
- Validate their experiences
- Avoid diagnosing or labeling
- Don't provide medical advice
- Highlight positive patterns and resilience
- Speak directly to them with warmth

Entries:\n\n${entriesText}

Offer a brief, gentle insight about their emotional journey this month.`;

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
            });
            const text = response.candidates[0].content.parts[0].text
                .replace(/<[^>]*>/g, '') // Remove HTML tags
                .replace(/\*\*(.*?)\*\*/g, '$1') // Remove markdown bold
                .replace(/\*(.*?)\*/g, '$1'); // Remove markdown italic
            return res.json({
                response: text,
                entries: entriesWithIds,
            });
        }

        // Get writing prompts
        if (
            msg.includes('give me a prompt') ||
            msg.includes('journal prompt')
        ) {
            const promptTypes = {
                'self-reflection':
                    'Write a reflective entry about your personal growth',
                gratitude: 'What are you most grateful for today?',
                goals: 'What goals would you like to set?',
                emotions: 'How are you feeling right now and why?',
            };

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: `You are a gentle journaling guide. Create a warm, inviting prompt that encourages reflection.

Guidelines:
- Use caring, conversational language
- Focus on growth and self-discovery
- Avoid heavy or overwhelming topics
- Make it feel safe and supportive
- Keep it simple and accessible
- Don't use excessive formatting

Consider areas like: ${Object.keys(promptTypes).join(', ')}

Generate a prompt that feels like a caring conversation starter.`,
            });
            const prompt = response.candidates[0].content.parts[0].text
                .replace(/<[^>]*>/g, '') // Remove HTML tags
                .replace(/\*\*(.*?)\*\*/g, '$1') // Remove markdown bold
                .replace(/\*(.*?)\*/g, '$1'); // Remove markdown italic
            return res.json({ response: prompt });
        }

        // Get advice based on journal entries
        if (
            msg.includes('give me advice') ||
            msg.includes('what should i do')
        ) {
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

            const entries = await Entry.find({
                userId: userId,
                date: { $gte: thirtyDaysAgo },
            }).sort({ date: -1 });

            if (entries.length === 0) {
                return res.json({
                    response:
                        "I need some recent journal entries to provide meaningful advice. Please write about what's on your mind first.",
                });
            }

            const entriesText = entries
                .map((entry) => {
                    const localDate = new Date(entry.date);
                    return `Date: ${localDate.getFullYear()}-${String(
                        localDate.getMonth() + 1
                    ).padStart(2, '0')}-${String(localDate.getDate()).padStart(
                        2,
                        '0'
                    )}\n${entry.content}`;
                })
                .join('\n\n');

            const entriesWithIds = entries.map((entry) => ({
                _id: entry._id,
                date: entry.date.toISOString().split('T')[0],
                title: entry.title,
                content: entry.content.replace(/<[^>]*>/g, ''), // Clean HTML from content
                mood: entry.mood,
            }));

            const prompt = `You are a wise, supportive friend who has been listening to someone's journal entries. Offer brief, gentle guidance based on what you've observed.

Guidelines:
- Keep response brief (2-3 sentences max)
- Use warm, conversational language
- Focus on their strengths and resilience
- Avoid giving medical, legal, or professional advice
- Don't diagnose or label conditions
- Encourage self-compassion and patience
- Suggest gentle, practical steps
- Validate their experiences
- Speak directly to them with care

Entries:\n\n${entriesText}

Offer brief, supportive insights like a caring friend would.`;

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
            });
            const advice = response.candidates[0].content.parts[0].text
                .replace(/<[^>]*>/g, '') // Remove HTML tags
                .replace(/\*\*(.*?)\*\*/g, '$1') // Remove markdown bold
                .replace(/\*(.*?)\*/g, '$1'); // Remove markdown italic
            return res.json({
                response: advice,
            });
        }

        // Handle date-specific queries (only if not already handled by context)
        if (
            (msg.includes('what happened') ||
                msg.includes('show entries from')) &&
            !(
                context &&
                context.recentEntries &&
                (msg.includes('yesterday') ||
                    msg.includes('today') ||
                    msg.includes('last week'))
            )
        ) {
            let targetDate;
            let endDate;

            if (
                msg.includes('last year this day') ||
                msg.includes('last year on this day')
            ) {
                targetDate = new Date();
                targetDate.setFullYear(targetDate.getFullYear() - 1);
                targetDate.setHours(0, 0, 0, 0);
                endDate = new Date(targetDate);
                endDate.setHours(23, 59, 59, 999);
            } else if (
                msg.includes('last month this day') ||
                msg.includes('last month on this day')
            ) {
                targetDate = new Date();
                targetDate.setMonth(targetDate.getMonth() - 1);
                targetDate.setHours(0, 0, 0, 0);
                endDate = new Date(targetDate);
                endDate.setHours(23, 59, 59, 999);
            } else if (msg.includes('last week')) {
                // For "last week" queries, provide summary only without entry viewing
                const sevenDaysAgo = new Date();
                sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

                const entries = await Entry.find({
                    userId: userId,
                    date: { $gte: sevenDaysAgo },
                }).sort({ date: 1 });

                if (entries.length === 0) {
                    return res.json({
                        response:
                            "You don't have any entries from the past week.",
                    });
                }

                const entriesText = entries
                    .map(
                        (entry) =>
                            `Date: ${entry.date.toISOString().split('T')[0]}\n${
                                entry.content
                            }`
                    )
                    .join('\n\n');

                const prompt = `You are a supportive journaling companion. Provide a brief reflection on this past week.

Guidelines:
- Keep response brief (2-3 sentences max)
- Use warm, conversational language
- Focus on key emotional patterns and growth
- Be encouraging and supportive
- Avoid clinical analysis
- Speak directly to them with understanding

Entries:\n\n${entriesText}

Offer a brief, caring summary of their week.`;

                const response = await ai.models.generateContent({
                    model: 'gemini-2.5-flash',
                    contents: prompt,
                });

                const text = response.candidates[0].content.parts[0].text
                    .replace(/<[^>]*>/g, '') // Remove HTML tags
                    .replace(/\*\*(.*?)\*\*/g, '$1') // Remove markdown bold
                    .replace(/\*(.*?)\*/g, '$1'); // Remove markdown italic

                return res.json({
                    response: text,
                });
            } else {
                // Try to parse specific date
                const dateStr = message
                    .toLowerCase()
                    .replace('what happened on ', '')
                    .replace('what happened in ', '');

                targetDate = new Date(dateStr);
                if (!isNaN(targetDate.getTime())) {
                    // Create dates in local timezone
                    targetDate = new Date(
                        targetDate.getFullYear(),
                        targetDate.getMonth(),
                        targetDate.getDate(),
                        0,
                        0,
                        0,
                        0
                    );
                    endDate = new Date(
                        targetDate.getFullYear(),
                        targetDate.getMonth(),
                        targetDate.getDate(),
                        23,
                        59,
                        59,
                        999
                    );
                }
            }

            if (!targetDate || isNaN(targetDate.getTime())) {
                return res.json({
                    response:
                        "I couldn't understand the date you're asking about. Try formats like 'what happened last week', 'what happened last month this day', 'what happened last year on this day', or 'what happened on April 28, 2025'",
                });
            }

            const query = {
                userId,
                date: {
                    $gte: targetDate,
                    $lte: endDate,
                },
            };

            const entries = await Entry.find(query).sort({ date: 1 });

            if (entries.length === 0) {
                const formattedDate = `${targetDate.getFullYear()}-${String(
                    targetDate.getMonth() + 1
                ).padStart(2, '0')}-${String(targetDate.getDate()).padStart(
                    2,
                    '0'
                )}`;
                return res.json({
                    response: `I couldn't find any entries from ${formattedDate}`,
                });
            }

            const entriesText = entries
                .map(
                    (entry) =>
                        `Date: ${entry.date.toISOString().split('T')[0]}\n${
                            entry.content
                        }`
                )
                .join('\n\n');

            const entriesWithIds = entries.map((entry) => ({
                _id: entry._id,
                date: entry.date.toISOString().split('T')[0],
                title: entry.title,
                content: entry.content.replace(/<[^>]*>/g, ''), // Clean HTML from content
                mood: entry.mood,
            }));

            const prompt = `You are a compassionate journaling companion. Reflect on these entries with warmth and understanding.

Guidelines:
- Use natural, caring language
- Focus on their emotional journey
- Highlight growth and insights
- Be validating and supportive
- Avoid clinical analysis
- Speak directly to them
- Show appreciation for their self-reflection

Entries:\n\n${entriesText}

Provide a gentle, thoughtful reflection on this period of their life.`;

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
            });
            const text = response.candidates[0].content.parts[0].text
                .replace(/<[^>]*>/g, '') // Remove HTML tags
                .replace(/\*\*(.*?)\*\*/g, '$1') // Remove markdown bold
                .replace(/\*(.*?)\*/g, '$1'); // Remove markdown italic
            return res.json({
                response: text,
                entries: entriesWithIds,
            });
        }

        if (msg.includes('show all entries')) {
            const allEntries = await Entry.find({
                userId: userId, // This should match the ID from your token
            }).sort({ date: -1 });

            console.log('Query Debug:', {
                searchedUserId: userId,
                foundEntries: allEntries.length,
            });

            if (allEntries.length === 0) {
                return res.json({
                    response: "You don't have any entries yet.",
                });
            }

            const entriesSummary = allEntries.map((entry) => ({
                _id: entry._id,
                date: entry.date.toISOString().split('T')[0],
                title: entry.title,
                content: entry.content,
                mood: entry.mood,
            }));

            return res.json({
                response: 'Here are all your entries:',
                entries: entriesSummary,
            });
        }

        if (
            message.toLowerCase().includes('summarize last five days') ||
            message.toLowerCase().includes('summarize last 5 days')
        ) {
            const fiveDaysAgo = new Date();
            fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);

            const entries = await Entry.find({
                userId: userId,
                date: { $gte: fiveDaysAgo },
            }).sort({ date: 1 });

            if (entries.length === 0) {
                return res.json({
                    response:
                        "You don't have any entries from the last five days.",
                });
            }

            // Prepare entries for AI prompt
            const entriesText = entries
                .map(
                    (entry) =>
                        `Date: ${entry.date.toISOString().split('T')[0]}\n${
                            entry.content
                        }`
                )
                .join('\n\n');

            const prompt = `You are a supportive journaling companion. Provide a brief, caring reflection on these past 5 days.

Guidelines:
- Keep response concise (2-3 sentences max)
- Use warm, conversational language
- Focus on key emotional patterns
- Be encouraging and supportive
- Avoid clinical or analytical tone
- Speak directly to them with understanding

Entries:\n\n${entriesText}

Offer a brief, caring summary of their recent journey.`;

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
            });

            const cleanResponse = response.candidates[0].content.parts[0].text
                .replace(/<[^>]*>/g, '') // Remove HTML tags
                .replace(/\*\*(.*?)\*\*/g, '$1') // Remove markdown bold
                .replace(/\*(.*?)\*/g, '$1'); // Remove markdown italic
            res.json({ response: cleanResponse });
        } else {
            res.json({
                response: `Hi! I'm here to help you explore and understand your journaling journey. Here's what I can do for you:

📝 Reflect on your writing:
• "summarize last five days" or "how was my week?"
• "analyze my mood" or "how am I feeling lately?"
• "give me advice" for gentle guidance based on your entries

🔍 Find past memories:
• "find entries about work" (or any topic you're curious about)
• "what happened last month on this day?"
• "what happened last year on this day?"
• "what happened on April 28, 2025" (any specific date)

✨ Get inspired:
• "give me a prompt" for thoughtful writing ideas
• "show all entries" to see your complete journal

Just ask me naturally - I understand conversational language and I'm here to support your reflection and growth.`,
            });
        }
    } catch (error) {
        console.error('Chat Assistant Error:', error);
        res.status(500).json({
            error: 'An error occurred while processing your request',
        });
    }
};

export const generatePeriodSummary = async (req, res) => {
    try {
        const { period } = req.body;
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({
                error: 'No user ID found in request',
            });
        }

        let startDate, endDate;
        const now = new Date();

        switch (period) {
            case 'daily':
                startDate = startOfDay(now);
                endDate = endOfDay(now);
                break;
            case 'weekly':
                startDate = startOfWeek(now);
                endDate = endOfWeek(now);
                break;
            case 'monthly':
                startDate = startOfMonth(now);
                endDate = endOfMonth(now);
                break;
            case 'yearly':
                startDate = startOfYear(now);
                endDate = endOfYear(now);
                break;
            default:
                return res.status(400).json({
                    error: 'Invalid period. Use daily, weekly, monthly, or yearly',
                });
        }

        const entries = await Entry.find({
            userId: userId,
            date: { $gte: startDate, $lt: endDate },
        }).sort({ date: 1 });

        if (entries.length === 0) {
            return res.json({
                summary: `No entries found for the ${period} period.`,
                period,
                entryCount: 0,
                dateRange: {
                    start: startDate.toISOString(),
                    end: endDate.toISOString(),
                },
            });
        }

        const entriesText = entries
            .map(
                (entry) =>
                    `Time: ${entry.date.toISOString()}\nTitle: ${
                        entry.title
                    }\nMood: ${entry.mood || 'not specified'}\nContent: ${
                        entry.content
                    }`
            )
            .join('\n\n---\n\n');

        const prompt = `You are a compassionate journaling companion reflecting on someone's ${period} journey. Provide a brief, supportive summary.

Guidelines:
- Keep response concise (2-3 sentences max)
- Use natural, caring language
- Focus on key emotional patterns and growth
- Validate their experiences
- Highlight their resilience and insights
- Avoid clinical or overly analytical tone
- Don't provide medical advice or diagnoses
- Speak directly to them with empathy
- Be encouraging about their journey

Entries:
${entriesText}

Provide a brief, warm reflection on their ${period} journey.`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });

        const summary = response.candidates[0].content.parts[0].text;

        res.json({
            summary,
            period,
            entryCount: entries.length,
            dateRange: {
                start: startDate.toISOString(),
                end: endDate.toISOString(),
            },
        });
    } catch (error) {
        console.error('Period summary generation error:', error);
        res.status(500).json({
            error: 'Failed to generate period summary',
        });
    }
};
