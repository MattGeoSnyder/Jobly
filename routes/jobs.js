"use strict";

const jsonschema = require("jsonschema");
const express = require("express");

const { BadRequestError } = require("../expressError.js");
const { ensureLoggedIn, isAdmin } = require('../middleware/auth.js');
const Job = require('../models/job.js');

const jobNewSchema = require('../schemas/jobNew.json');
const jobUpdateSchema = require('../schemas/jobUpdate.json');

const router = new express.Router();

router.post('/', [ensureLoggedIn, isAdmin], async (req, res, next) => {
    debugger;
    try {
        const validator = jsonschema.validate(req.body, jobNewSchema);
        if (!validator.valid) {
            const errs = validator.error.map(e => e.stack);
            throw new BadRequestError(errs);
        }

        const job = await Job.create(req.body);
        return res.status(201).json({ job });
    } catch (error) {
        return next(error);
    }
});

router.get('/', async (req, res, next) => {
    try {
        const jobs = await Job.findAll();
        return res.json({ jobs })
    } catch (error) {
        return next(error);
    }
});

router.get("/:id", async (req, res, next) => {
    try {
        const job = await Job.get(req.params.id);
        return res.json({ job });
    } catch (error) {
        return next(error);
    }
});

router.patch('/:id', [ensureLoggedIn, isAdmin], async (req, res, next) => {
    try {
        const validator = jsonschema.validate(req.body, jobUpdateSchema);
        if (!validator.valid) {
            const errs = validator.errors.map(e => e.stack);
            throw new BadRequestError(errs);
        }

        const job = await Job.update(req.params.id, req.body);
        return res.json({ job });
    } catch (error) {
        return next(error);
    }
});

router.delete('/:id', [ensureLoggedIn, isAdmin], async (req, res, next) => {
    try {
        await Job.remove(req.params.id);
        return res.json({ deleted: req.params.id });
    } catch (error) {
        return next(error);
    }
});

module.exports = router;