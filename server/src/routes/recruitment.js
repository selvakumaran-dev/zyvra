const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const recruitmentController = require('../controllers/recruitmentController');

// Jobs
router.get('/jobs', recruitmentController.getAllJobs);
router.post('/jobs', recruitmentController.createJob);
router.put('/jobs/:id', recruitmentController.updateJob);
router.delete('/jobs/:id', recruitmentController.deleteJob);


// Candidates
router.get('/candidates', recruitmentController.getAllCandidates);
router.post('/candidates', recruitmentController.createCandidate);
router.patch('/candidates/:id/status', recruitmentController.updateCandidateStatus);

// Job Applications (for applicants)
const { auth } = require('../middleware/auth');
const Applicant = require('../models/Applicant');
const Job = require('../models/Job');

const upload = require('../middleware/upload');

router.post('/jobs/:jobId/apply', auth, upload.single('resume'), async (req, res) => {
    try {
        const { jobId } = req.params;
        const { coverLetter, yearsOfExperience, skills } = req.body;
        const resumeFile = req.file;

        // Get applicant from user
        if (req.user.role !== 'Applicant') {
            return res.status(403).json({
                error: {
                    code: 'FORBIDDEN',
                    message: 'Only applicants can apply for jobs'
                }
            });
        }

        if (!resumeFile) {
            return res.status(400).json({
                error: {
                    code: 'MISSING_RESUME',
                    message: 'Resume file is required'
                }
            });
        }

        const applicant = await Applicant.findById(req.user.applicant);
        if (!applicant) {
            return res.status(404).json({
                error: {
                    code: 'APPLICANT_NOT_FOUND',
                    message: 'Applicant profile not found'
                }
            });
        }

        // Check if already applied
        const alreadyApplied = applicant.applications.some(
            app => app.job.toString() === jobId
        );

        if (alreadyApplied) {
            return res.status(400).json({
                error: {
                    code: 'ALREADY_APPLIED',
                    message: 'You have already applied for this job'
                }
            });
        }

        // Update applicant experience and skills if provided
        if (yearsOfExperience !== undefined) {
            applicant.experience = yearsOfExperience;
        }
        if (skills) {
            try {
                // Parse skills if it's a JSON string (from FormData)
                const parsedSkills = typeof skills === 'string' ? JSON.parse(skills) : skills;
                if (Array.isArray(parsedSkills) && parsedSkills.length > 0) {
                    applicant.skills = parsedSkills;
                }
            } catch (e) {
                console.error('Error parsing skills:', e);
            }
        }

        // Update resume path
        applicant.resume = resumeFile.path;

        // Add application
        applicant.applications.push({
            job: jobId,
            coverLetter: coverLetter || '',
            status: 'Applied',
            appliedAt: new Date()
        });

        await applicant.save();

        res.status(201).json({
            success: true,
            message: 'Application submitted successfully',
            data: {
                applicationId: applicant.applications[applicant.applications.length - 1]._id
            }
        });
    } catch (error) {
        console.error('Job application error:', error);
        res.status(500).json({
            error: {
                code: 'APPLICATION_FAILED',
                message: error.message
            }
        });
    }
});

// Get application count for a job
router.get('/jobs/:jobId/applications/count', auth, async (req, res) => {
    try {
        const { jobId } = req.params;

        const count = await Applicant.countDocuments({
            'applications.job': jobId
        });

        res.json({
            success: true,
            data: { count }
        });
    } catch (error) {
        res.status(500).json({
            error: {
                code: 'FETCH_FAILED',
                message: error.message
            }
        });
    }
});

// Get all applications for a job (HR only)
router.get('/jobs/:jobId/applications', auth, async (req, res) => {
    try {
        if (req.user.role !== 'HR') {
            return res.status(403).json({
                error: {
                    code: 'FORBIDDEN',
                    message: 'Only HR can view applications'
                }
            });
        }

        const { jobId } = req.params;

        const applicants = await Applicant.find({
            'applications.job': jobId
        }).select('firstName lastName email phone experience skills resume applications');

        const applications = applicants.map(applicant => {
            const application = applicant.applications.find(
                app => app.job.toString() === jobId
            );
            return {
                applicantId: applicant._id,
                name: `${applicant.firstName} ${applicant.lastName}`,
                email: applicant.email,
                phone: applicant.phone,
                experience: applicant.experience,
                skills: applicant.skills,
                resume: applicant.resume,
                coverLetter: application.coverLetter,
                status: application.status,
                appliedAt: application.appliedAt
            };
        });

        res.json({
            success: true,
            data: applications
        });
    } catch (error) {
        res.status(500).json({
            error: {
                code: 'FETCH_FAILED',
                message: error.message
            }
        });
    }
});

// Public Routes (No Auth Required)

// Get all open jobs (Public)
router.get('/public/jobs', async (req, res) => {
    try {
        const jobs = await Job.find({ status: 'Open' })
            .select('title department location type description requirements salaryRange createdAt')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            data: jobs
        });
    } catch (error) {
        res.status(500).json({
            error: {
                code: 'FETCH_FAILED',
                message: error.message
            }
        });
    }
});

// Public Job Application
router.post('/public/jobs/:jobId/apply', upload.single('resume'), async (req, res) => {
    try {
        const { jobId } = req.params;
        const {
            firstName,
            lastName,
            email,
            phone,
            coverLetter,
            yearsOfExperience,
            skills
        } = req.body;
        const resumeFile = req.file;

        if (!resumeFile) {
            return res.status(400).json({
                error: {
                    code: 'MISSING_RESUME',
                    message: 'Resume file is required'
                }
            });
        }

        // Check if applicant exists
        let applicant = await Applicant.findOne({ email });

        if (!applicant) {
            // Create new applicant
            applicant = new Applicant({
                firstName,
                lastName,
                email,
                phone,
                experience: yearsOfExperience || 0,
                skills: skills ? (typeof skills === 'string' ? JSON.parse(skills) : skills) : [],
                resume: resumeFile.path
            });
        } else {
            // Update existing applicant info
            if (yearsOfExperience) applicant.experience = yearsOfExperience;
            if (skills) {
                const parsedSkills = typeof skills === 'string' ? JSON.parse(skills) : skills;
                if (Array.isArray(parsedSkills) && parsedSkills.length > 0) {
                    applicant.skills = parsedSkills;
                }
            }
            applicant.resume = resumeFile.path; // Update resume with newest version
        }

        // Check if already applied
        const alreadyApplied = applicant.applications.some(
            app => app.job.toString() === jobId
        );

        if (alreadyApplied) {
            return res.status(400).json({
                error: {
                    code: 'ALREADY_APPLIED',
                    message: 'You have already applied for this job'
                }
            });
        }

        // Add application
        applicant.applications.push({
            job: jobId,
            coverLetter: coverLetter || '',
            status: 'Applied',
            appliedAt: new Date()
        });

        await applicant.save();

        res.status(201).json({
            success: true,
            message: 'Application submitted successfully',
            data: {
                applicationId: applicant.applications[applicant.applications.length - 1]._id
            }
        });

    } catch (error) {
        console.error('Public application error:', error);
        res.status(500).json({
            error: {
                code: 'APPLICATION_FAILED',
                message: error.message
            }
        });
    }
});

// Get all applicants (HR only)
router.get('/applicants', auth, async (req, res) => {
    try {
        if (req.user.role !== 'HR' && req.user.role !== 'ADMIN') {
            return res.status(403).json({
                error: {
                    code: 'FORBIDDEN',
                    message: 'Only HR can view applicants'
                }
            });
        }

        const applicants = await Applicant.find()
            .select('firstName lastName email phone experience skills resume applications')
            .sort({ _id: -1 }); // Newest first

        const formattedApplicants = applicants.map(app => ({
            _id: app._id,
            name: `${app.firstName} ${app.lastName}`,
            email: app.email,
            phone: app.phone,
            experience: app.experience,
            skills: app.skills,
            resume: app.resume,
            applicationCount: app.applications.length,
            latestApplicationDate: app.applications.length > 0
                ? app.applications[app.applications.length - 1].appliedAt
                : null
        }));

        res.json({
            success: true,
            data: formattedApplicants
        });
    } catch (error) {
        console.error('Fetch applicants error:', error);
        res.status(500).json({
            error: {
                code: 'FETCH_FAILED',
                message: error.message
            }
        });
    }
});

// Get single applicant details (HR only)
router.get('/applicants/:applicantId', auth, async (req, res) => {
    try {
        if (req.user.role !== 'HR' && req.user.role !== 'ADMIN') {
            return res.status(403).json({
                error: {
                    code: 'FORBIDDEN',
                    message: 'Only HR can view applicant details'
                }
            });
        }

        const { applicantId } = req.params;
        const applicant = await Applicant.findById(applicantId).populate('applications.job', 'title department location');

        if (!applicant) {
            return res.status(404).json({
                error: {
                    code: 'NOT_FOUND',
                    message: 'Applicant not found'
                }
            });
        }

        res.json({
            success: true,
            data: {
                _id: applicant._id,
                name: `${applicant.firstName} ${applicant.lastName}`,
                email: applicant.email,
                phone: applicant.phone,
                experience: applicant.experience,
                skills: applicant.skills,
                resume: applicant.resume,
                applications: applicant.applications
            }
        });

    } catch (error) {
        console.error('Fetch applicant details error:', error);
        res.status(500).json({
            error: {
                code: 'FETCH_FAILED',
                message: error.message
            }
        });
    }
});

// Delete applicant (HR only)
router.delete('/applicants/:applicantId', auth, async (req, res) => {
    try {
        if (req.user.role !== 'HR' && req.user.role !== 'ADMIN') {
            return res.status(403).json({
                error: {
                    code: 'FORBIDDEN',
                    message: 'Only HR can delete applicants'
                }
            });
        }

        const { applicantId } = req.params;
        const applicant = await Applicant.findById(applicantId);

        if (!applicant) {
            return res.status(404).json({
                error: {
                    code: 'NOT_FOUND',
                    message: 'Applicant not found'
                }
            });
        }

        // Delete resume file if exists
        if (applicant.resume) {
            const resumePath = path.join(__dirname, '../../', applicant.resume);
            if (fs.existsSync(resumePath)) {
                fs.unlinkSync(resumePath);
            }
        }

        // Delete applicant record
        await Applicant.findByIdAndDelete(applicantId);

        res.json({
            success: true,
            message: 'Applicant deleted successfully'
        });

    } catch (error) {
        console.error('Delete applicant error:', error);
        res.status(500).json({
            error: {
                code: 'DELETE_FAILED',
                message: error.message
            }
        });
    }
});

module.exports = router;
