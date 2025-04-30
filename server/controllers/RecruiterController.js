const Recruiter = require('../models/Recruiter');

class RecruiterController {
  // Get recruiter profile
  async getProfile(req, res) {
    try {
      console.log('User ID:', req.user._id);
      const recruiter = await Recruiter.findById(req.user._id)
        .select('-password -__v');
      
      if (!recruiter) {
        return res.status(404).json({ message: 'Recruiter not found' });
      }

      res.json(recruiter);
    } catch (error) {
      console.error('Error fetching recruiter profile:', error);
      res.status(500).json({ message: 'Error fetching profile' });
    }
  }

  // Update recruiter profile
  async updateProfile(req, res) {
    try {
      console.log('Update request body:', req.body);
      const {
        name,
        phoneNumber,
        companyName,
        companyWebsite,
        location,
        about
      } = req.body;

      const recruiter = await Recruiter.findById(req.user._id);

      if (!recruiter) {
        return res.status(404).json({ message: 'Recruiter not found' });
      }

      // Update fields if provided
      if (name) recruiter.name = name;
      if (phoneNumber) recruiter.phoneNumber = phoneNumber;
      if (companyName) recruiter.companyName = companyName;
      if (companyWebsite) recruiter.companyWebsite = companyWebsite;
      if (location) recruiter.location = location;
      if (about) recruiter.about = about;

      await recruiter.save();

      res.json({
        message: 'Profile updated successfully',
        profile: recruiter.toObject({ getters: true, versionKey: false, transform: (doc, ret) => {
          delete ret.password;
          return ret;
        }})
      });
    } catch (error) {
      console.error('Error updating recruiter profile:', error);
      res.status(500).json({ message: 'Error updating profile' });
    }
  }
}

module.exports = new RecruiterController(); 