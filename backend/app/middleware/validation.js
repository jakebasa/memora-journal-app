export const validateRequest = (schema) => {
    return (req, res, next) => {
        try {
            const validatedData = schema.parse(req.body);
            req.body = validatedData;
            next();
        } catch (error) {
            if (error.errors) {
                return res.status(400).json({
                    success: false,
                    message: 'Validation failed',
                    errors: error.errors.map(err => ({
                        field: err.path.join('.'),
                        message: err.message
                    }))
                });
            }
            return res.status(400).json({
                success: false,
                message: 'Invalid request data'
            });
        }
    };
};

export const validateQuery = (schema) => {
    return (req, res, next) => {
        try {
            // Allow empty query object
            const queryToValidate = Object.keys(req.query).length === 0 ? {} : req.query;
            const validatedData = schema.parse(queryToValidate);
            req.query = validatedData;
            next();
        } catch (error) {
            console.error('Query validation error:', error);
            if (error.errors) {
                return res.status(400).json({
                    success: false,
                    message: 'Query validation failed',
                    errors: error.errors.map(err => ({
                        field: err.path.join('.'),
                        message: err.message
                    }))
                });
            }
            return res.status(400).json({
                success: false,
                message: 'Invalid query parameters'
            });
        }
    };
};
