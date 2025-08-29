import Entry from '../models/Entry.js';

export const createEntry = async (req, res) => {
    try {
        const { title, content, tags, mood, date } = req.body;
        const entry = await Entry.create({
            userId: req.user.id,
            title,
            content,
            tags,
            mood,
            date,
        });
        res.status(201).json(entry);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// controllers/entryController.js
export const getEntries = async (req, res) => {
    try {
        const filter = { userId: req.user.id };

        if (req.query.mood) filter.mood = req.query.mood;
        if (req.query.tag) filter.tags = req.query.tag;

        if (req.query.date) {
            const day = new Date(req.query.date);
            const startOfDay = new Date(day.setHours(0, 0, 0, 0));
            const endOfDay = new Date(day.setHours(23, 59, 59, 999));

            filter.date = { $gte: startOfDay, $lte: endOfDay };
        }

        const entries = await Entry.find(filter).sort({ date: -1 });
        res.status(200).json(entries);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const getEntryById = async (req, res) => {
    try {
        const entry = await Entry.findOne({
            _id: req.params.id,
            userId: req.user.id,
        });
        if (!entry) return res.status(404).json({ message: 'Entry not found' });
        res.status(200).json(entry);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const updateEntry = async (req, res) => {
    try {
        const entry = await Entry.findOneAndUpdate(
            { _id: req.params.id, userId: req.user.id },
            req.body,
            { new: true }
        );
        if (!entry) return res.status(404).json({ message: 'Entry not found' });
        res.status(200).json(entry);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const deleteEntry = async (req, res) => {
    try {
        const entry = await Entry.findOneAndDelete({
            _id: req.params.id,
            userId: req.user.id,
        });
        if (!entry) return res.status(404).json({ message: 'Entry not found' });
        res.status(200).json({ message: 'Entry deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
