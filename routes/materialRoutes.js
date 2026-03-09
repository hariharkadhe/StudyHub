const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// GET all materials
router.get('/', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('materials')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE material
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { userId } = req.query;

        // Verify ownership
        const { data: material, error: fetchError } = await supabase
            .from('materials')
            .select('*')
            .eq('id', id)
            .single();

        if (fetchError || !material) return res.status(404).json({ error: "Not found" });
        if (material.uploaded_by_id !== userId) return res.status(403).json({ error: "Forbidden" });

        // Delete from DB
        const { error: dbError } = await supabase
            .from('materials')
            .delete()
            .eq('id', id);

        if (dbError) throw dbError;

        // Note: For Storage deletion, we'd need the filename and path
        // We can add that logic if needed, but for now metadata is gone.

        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
