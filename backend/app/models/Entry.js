import mongoose from 'mongoose';

const entrySchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        title: String,
        content: String,
        tags: [String],
        mood: String,
        images: [{
            url: String,
            publicId: String,
            alt: String,
            uploadedAt: { type: Date, default: Date.now }
        }],
        date: { type: Date, default: Date.now },
    },
    { timestamps: true }
);

// Add database indexes for performance
entrySchema.index({ userId: 1, date: -1 }); // Most common query pattern
entrySchema.index({ userId: 1, tags: 1 }); // Tag filtering
entrySchema.index({ userId: 1, mood: 1 }); // Mood filtering
entrySchema.index({ userId: 1, createdAt: -1 }); // Recent entries

export default mongoose.model('Entry', entrySchema);
