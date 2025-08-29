// // deleteEntries.js
// import mongoose from 'mongoose';
// import dotenv from 'dotenv';
// import Entry from './Entry.js';

// dotenv.config({ path: '../../.env' });

// const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/journal';

// async function clearAllEntries() {
//     try {
//         await mongoose.connect(MONGO_URI);

//         const result = await Entry.deleteMany({});
//         console.log(`🗑 Removed ${result.deletedCount} entries (all users)`);

//         process.exit(0);
//     } catch (err) {
//         console.error('❌ Error deleting entries:', err);
//         process.exit(1);
//     }
// }

// clearAllEntries();

// // seed.js
// import mongoose from "mongoose";
// import dotenv from "dotenv";
// import Entry from "./Entry.js";
// import User from "./User.js";

// dotenv.config({ path: "../../.env" });

// const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/journal";

// const moods = [
//   "😊",
//   "😌",
//   "😄",
//   "🤔",
//   "😴",
//   "😓",
//   "😢",
//   "😤",
//   "🎉",
//   "💪",
//   "🌱",
//   "❤️",
//   "🤗",
//   "😇",
//   "🧘",
//   "💭",
// ];

// const richSamples = [
//   `<p>This is a <strong>bold statement</strong> and here’s some <em>italic text</em>.</p>`,
//   `<p>Here are my goals:</p><ul><li>Finish project</li><li>Exercise daily</li><li>Read a book</li></ul>`,
//   `<blockquote>“Sometimes, the smallest step in the right direction ends up being the biggest step of your life.”</blockquote>`,
//   `<p>Feeling <u>grateful</u> today for my family and friends. ❤️</p>`,
//   `<p>Quick notes:</p><ol><li>Call mom</li><li>Submit report</li><li>Meditate before bed</li></ol>`,
// ];

// const tags = [["work"], ["gratitude"], ["focus"], ["health"], ["life"]];

// async function seed() {
//   try {
//     await mongoose.connect(MONGO_URI);

//     // 👉 get your first user in the DB
//     const user = await User.findOne();
//     if (!user) {
//       console.error("❌ No users found in the database. Please create a user first.");
//       process.exit(1);
//     }

//     // Clear old entries for that user
//     await Entry.deleteMany({ userId: user._id });

//     const entries = [];
//     const today = new Date();
//     const yearsBack = 3;

//     for (let y = 0; y < yearsBack; y++) {
//       for (let m = 0; m < 12; m++) {
//         const count = Math.floor(Math.random() * 3) + 3; // 3–6 entries/month

//         for (let k = 0; k < count; k++) {
//           const day = Math.floor(Math.random() * 28) + 1; // safe days
//           const baseDate = new Date(today.getFullYear() - y, m, day);

//           entries.push({
//             userId: user._id,
//             title: `Entry ${y + 1}-${m + 1}-${k + 1}`,
//             content: richSamples[(y + m + k) % richSamples.length],
//             mood: moods[(y + m + k) % moods.length],
//             tags: tags[(y + m + k) % tags.length],
//             date: baseDate,
//           });
//         }
//       }
//     }

//     await Entry.insertMany(entries);
//     console.log(`✅ Seeded ${entries.length} entries for user ${user.email}`);
//     process.exit(0);
//   } catch (err) {
//     console.error("❌ Error seeding:", err);
//     process.exit(1);
//   }
// }

// seed();
// seed.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Entry from './Entry.js';
import User from './User.js';

dotenv.config({ path: '../../.env' });

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/journal';

const moods = [
    '😊',
    '😌',
    '😄',
    '🤔',
    '😴',
    '😓',
    '😢',
    '😤',
    '🎉',
    '💪',
    '🌱',
    '❤️',
    '🤗',
    '😇',
    '🧘',
    '💭',
];

const richSamples = [
    `<p>This is a <strong>bold statement</strong> and here’s some <em>italic text</em>.</p>`,
    `<p>Here are my goals:</p><ul><li>Finish project</li><li>Exercise daily</li><li>Read a book</li></ul>`,
    `<blockquote>“Sometimes, the smallest step in the right direction ends up being the biggest step of your life.”</blockquote>`,
    `<p>Feeling <u>grateful</u> today for my family and friends. ❤️</p>`,
    `<p>Quick notes:</p><ol><li>Call mom</li><li>Submit report</li><li>Meditate before bed</li></ol>`,
];

const tags = [['work'], ['gratitude'], ['focus'], ['health'], ['life']];

async function seed() {
    try {
        await mongoose.connect(MONGO_URI);

        // 👉 Change this to your real account email
        const user = await User.findOne({ email: 'jakebasa17@gmail.com' });
        if (!user) {
            console.log('❌ No such user found. Please check the email.');
            process.exit(0);
        }

        // Clear old entries for that user
        await Entry.deleteMany({ userId: user._id });

        const entries = [];
        const today = new Date();
        const yearsBack = 3;

        for (let y = 0; y < yearsBack; y++) {
            for (let m = 0; m < 12; m++) {
                // pick ~3–6 entries per month
                const count = Math.floor(Math.random() * 3) + 3;

                for (let k = 0; k < count; k++) {
                    const day = Math.floor(Math.random() * 28) + 1; // safe day
                    const baseDate = new Date(today.getFullYear() - y, m, day);

                    entries.push({
                        userId: user._id,
                        title: `Entry ${y + 1}-${m + 1}-${k + 1}`,
                        content: richSamples[(y + m + k) % richSamples.length],
                        mood: moods[(y + m + k) % moods.length],
                        tags: tags[(y + m + k) % tags.length],
                        date: baseDate, // journal date
                        createdAt: baseDate, // 👈 override timestamps
                        updatedAt: baseDate,
                    });
                }
            }
        }

        await Entry.insertMany(entries);
        console.log(`✅ Seeded ${entries.length} entries for ${user.email}`);
        process.exit(0);
    } catch (err) {
        console.error('❌ Error seeding:', err);
        process.exit(1);
    }
}

seed();
