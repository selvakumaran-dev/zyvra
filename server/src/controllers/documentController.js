const Document = require('../models/Document');

exports.uploadDocument = async (req, res) => {
    try {
        // In a real app, we would handle file upload to S3/Cloudinary here
        // For now, we just save the metadata
        const newDoc = new Document(req.body);
        const savedDoc = await newDoc.save();
        res.status(201).json({ data: savedDoc });
    } catch (error) {
        res.status(400).json({ error: { message: error.message } });
    }
};

exports.getEmployeeDocuments = async (req, res) => {
    try {
        const docs = await Document.find({ employee: req.params.employeeId })
            .sort({ createdAt: -1 });
        res.json({ data: docs });
    } catch (error) {
        res.status(500).json({ error: { message: error.message } });
    }
};
