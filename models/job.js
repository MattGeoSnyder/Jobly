"use strict";

const db = require('../db.js');
const { BadRequestError, NotFoundError } = require("../expressError.js");
const { sqlForPartialUpdate } = require('../helpers/sql.js');

class Job {
    static async create({title, salary, equity, companyHandle}) {
        const result = await db.query(`INSERT INTO jobs
                                        (title, salary, equity, company_handle)
                                        VALUES ($1, $2, $3, $4)
                                        RETURNING id, title, salary, company_handle AS companyHandle, equity;` 
                                        ,[title, salary, equity, companyHandle]);
        return result.rows[0];
    }

    static async findAll() {
        const jobs = await db.query(`SELECT title,
                                    salary,
                                    equity,
                                    company_handle AS companyHandle
                                FROM jobs;`);
    
        return jobs.rows;
    }

    static async get(id) {
        const job = await db.query(`SELECT id,
                                        title,
                                        salary,
                                        equity,
                                        company_handle AS companyHandle
                                    FROM jobs
                                    WHERE id = $1;`, [id])

        if (job.rows.length === 0) throw new NotFoundError(`No job: ${id}`);

        return job.rows[0];
    }

    static async update(id, data) {
        const { setCols, values } = sqlForPartialUpdate(data, {});
        const idVarIdx = "$" + (values.length + 1);

        const sqlQuery = `UPDATE jobs
                            SET ${setCols}
                            WHERE id = ${idVarIdx}
                            RETURNING id,
                                title, 
                                salary,
                                equity,
                                company_handle AS companyHandle`;
        
        
        const result = await db.query(sqlQuery, [...values, id]);
        const job = result.rows[0];

        if (!job) throw new NotFoundError(`No job: ${id}`);

        return job;
    }

    static async remove(id) {
        const result = await db.query(
            `DELETE
            FROM jobs
            WHERE id = $1
            RETURNING id`,
            [id]
        )

        const job = result.rows[0];
        if (!job) throw new NotFoundError(`No company: ${id}`);
    }
}

module.exports = Job;