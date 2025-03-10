const errorHandler = (err, req, res, next) => {
    console.error(err.stack); // Log the error stack for debugging

    res.status(err.status || 500).json({
        message: err.message || 'Internal Server Error',
        // Optionally include more error details in development
        ...(process.env.NODE_ENV === 'development' && { error: err }),
    });
};

export default errorHandler; 