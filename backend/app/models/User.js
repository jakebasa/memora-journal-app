import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
    {
        name: { type: String, required: true }, 
        email: { type: String, required: true, unique: true },
        passwordHash: { type: String, required: true },
        theme: { 
            type: String, 
            enum: ['light', 'dark', 'system'], 
            default: 'system' 
        },
        colorTheme: {
            type: String,
            enum: ['sage', 'ocean', 'sunset', 'lavender', 'rose', 'mono'],
            default: 'sage'
        },
        resetPasswordToken: { type: String },
        resetPasswordExpires: { type: Date },
    },
    { timestamps: true }
);

export default mongoose.model('User', userSchema);
