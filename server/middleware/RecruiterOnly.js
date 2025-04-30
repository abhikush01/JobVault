const recruiterOnly = (req, res, next) => {
  // Check if user exists and is a recruiter
  if (!req.user || req.role !== 'recruiter') {
    return res.status(403).json({ message: 'Access denied. Recruiters only.' });
  }
  next();
};

module.exports = recruiterOnly; 