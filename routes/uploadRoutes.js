const express = require('express');
const router = express.Router();
const multer = require('multer');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 50 * 1024 * 1024 } // 50MB
});

router.post('/', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

        const { title, subject, semester, description, uploadedById, uploadedByName } = req.body;

        // 1. Upload to Supabase Storage
        const timestamp = Date.now();
        const fileName = `${timestamp}_${req.file.originalname}`;
        const filePath = `${uploadedById}/${fileName}`;

        const { data: storageData, error: storageError } = await supabase.storage
            .from('materials')
            .upload(filePath, req.file.buffer, {
                contentType: req.file.mimetype,
                upsert: false
            });

        if (storageError) throw storageError;

        // 2. Get Public URL
        const { data: urlData } = supabase.storage
            .from('materials')
            .getPublicUrl(filePath);

        const publicUrl = urlData.publicUrl;

        // 3. Save metadata to Supabase Database (table: materials)
        const { data: dbData, error: dbError } = await supabase
            .from('materials')
            .insert([
                {
                    title,
                    subject,
                    semester,
                    description,
                    file_url: publicUrl,
                    file_name: fileName,
                    uploaded_by_id: uploadedById,
                    uploaded_by_name: uploadedByName || 'Anonymous User',
                    downloads: 0
                }
            ])
            .select();

        if (dbError) throw dbError;

        res.status(200).json({ success: true, material: dbData[0] });

    } catch (error) {
        console.error('Supabase Upload Error:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
