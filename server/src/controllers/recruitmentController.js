const Job = require('../models/Job');
const Candidate = require('../models/Candidate');

// --- JOBS ---

exports.getAllJobs = async (req, res) => {
    try {
        const jobs = await Job.find().sort({ createdAt: -1 });
        res.json({ data: jobs });
    } catch (error) {
        res.status(500).json({ error: { message: error.message } });
    }
};

exports.createJob = async (req, res) => {
    try {
        const newJob = new Job(req.body);
        const savedJob = await newJob.save();
        res.status(201).json({ data: savedJob });
    } catch (error) {
        res.status(400).json({ error: { message: error.message } });
    }
};

exports.updateJob = async (req, res) => {
    try {
        const updatedJob = await Job.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!updatedJob) {
            return res.status(404).json({ error: { message: 'Job not found' } });
        }

        res.json({ data: updatedJob });
    } catch (error) {
        res.status(400).json({ error: { message: error.message } });
    }
};

exports.deleteJob = async (req, res) => {
    try {
        const deletedJob = await Job.findByIdAndDelete(req.params.id);

        if (!deletedJob) {
            return res.status(404).json({ error: { message: 'Job not found' } });
        }

        res.json({
            success: true,
            message: 'Job deleted successfully',
            data: deletedJob
        });
    } catch (error) {
        res.status(500).json({ error: { message: error.message } });
    }
};


// --- CANDIDATES ---

exports.getAllCandidates = async (req, res) => {
    try {
        const candidates = await Candidate.find().populate('jobId', 'title');
        res.json({ data: candidates });
    } catch (error) {
        res.status(500).json({ error: { message: error.message } });
    }
};

exports.createCandidate = async (req, res) => {
    try {
        const newCandidate = new Candidate(req.body);
        const savedCandidate = await newCandidate.save();
        res.status(201).json({ data: savedCandidate });
    } catch (error) {
        res.status(400).json({ error: { message: error.message } });
    }
};

exports.updateCandidateStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const candidate = await Candidate.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        );
        res.json({ data: candidate });
    } catch (error) {
        res.status(400).json({ error: { message: error.message } });
    }
};
