import User from '../models/User.js';

/**
 * Get user's theme preferences
 * GET /api/user/theme
 */
export const getUserTheme = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('theme colorTheme');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({ 
            theme: user.theme,
            colorTheme: user.colorTheme 
        });
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch theme', error: error.message });
    }
};

/**
 * Update user's theme preferences
 * PUT /api/user/theme
 */
export const updateUserTheme = async (req, res) => {
    try {
        const { theme, colorTheme } = req.body;
        const updateData = {};

        // Validate theme value if provided
        if (theme !== undefined) {
            const validThemes = ['light', 'dark', 'system'];
            if (!validThemes.includes(theme)) {
                return res.status(400).json({ 
                    message: 'Invalid theme. Must be one of: light, dark, system' 
                });
            }
            updateData.theme = theme;
        }

        // Validate colorTheme value if provided
        if (colorTheme !== undefined) {
            const validColorThemes = ['sage', 'ocean', 'sunset', 'lavender', 'rose', 'mono'];
            if (!validColorThemes.includes(colorTheme)) {
                return res.status(400).json({ 
                    message: 'Invalid color theme. Must be one of: sage, ocean, sunset, lavender, rose, mono' 
                });
            }
            updateData.colorTheme = colorTheme;
        }

        // Ensure at least one field is being updated
        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({ 
                message: 'No valid theme data provided' 
            });
        }

        const user = await User.findByIdAndUpdate(
            req.user.id,
            updateData,
            { new: true, select: 'theme colorTheme' }
        );

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({ 
            message: 'Theme updated successfully', 
            theme: user.theme,
            colorTheme: user.colorTheme
        });
    } catch (error) {
        res.status(500).json({ message: 'Failed to update theme', error: error.message });
    }
};

/**
 * Get user profile (including theme)
 * GET /api/user/profile
 */
export const getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-passwordHash');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({
            id: user._id,
            name: user.name,
            email: user.email,
            theme: user.theme,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
        });
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch profile', error: error.message });
    }
};
