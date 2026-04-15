const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Prisma unique constraint violation
  if (err.code === 'P2002') {
    return res.status(409).json({
      status: 'error',
      message: 'Profile already exists'
    });
  }

  // Prisma record not found
  if (err.code === 'P2025') {
    return res.status(404).json({
      status: 'error',
      message: 'Profile not found'
    });
  }

  // Default error
  res.status(500).json({
    status: 'error',
    message: 'Internal server error'
  });
};

module.exports = errorHandler;
