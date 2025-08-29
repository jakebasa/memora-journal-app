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
        date: { type: Date, default: Date.now },
    },
    { timestamps: true }
);

export default mongoose.model('Entry', entrySchema);
