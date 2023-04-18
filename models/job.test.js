"use strict";

const db = require("../db.js");
const { BadRequestError, NotFoundError } = require("../expressError");
const Job = require("./job.js");
const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/*************************************** create */

describe('create', () => {
    const newJob = {
        title: "New",
        salary: 100000,
        equity: 0.1,
        companyHandle: "c1"
    };

    test("works", async () => {
        let job = await Job.create(newJob);
        delete job.id;
        expect(job).toEqual({
            title: "New",
            salary: 100000,
            equity: "0.1",
            companyhandle: "c1"
        });

        const result = await db.query(
            `SELECT title, salary, equity, company_handle AS companyHandle
             FROM jobs
             WHERE title = 'New';`
        )
        expect(result.rows).toEqual([{
            title: "New",
            salary: 100000,
            equity: "0.1",
            companyhandle: "c1"
        }]);
    });
});

describe("findAll", () => {
    test('works: no filter', async () => {
        let jobs = await Job.findAll();
        expect(jobs).toEqual([
            {
                title: 'j1',
                salary: 1,
                equity: '0.1',
                companyhandle: "c1"
            },
            {
                title: 'j2',
                salary: 2,
                equity: '0.2',
                companyhandle: "c2"
            },
            {
                title: 'j3',
                salary: 3,
                equity: '0.3',
                companyhandle: "c3"
            }
        ]);
    });

    test('works filter title', async () => {
        let jobs = await Job.findAll({title: 'j1'});
        expect(jobs).toEqual([
            {
                title: 'j1',
                salary: 1,
                equity: '0.1',
                companyhandle: "c1"
            }
        ]);
    });

    test('works filter minSalary', async () => {
        let jobs = await Job.findAll({minSalary: 2});  
        expect(jobs).toEqual([
            {
                title: 'j2',
                salary: 2,
                equity: '0.2',
                companyhandle: "c2"
            },
            {
                title: 'j3',
                salary: 3,
                equity: '0.3',
                companyhandle: "c3"
            }
        ]);
    });

    test('works filter equity', async () => {
        let jobs = await Job.findAll({equity: true}); 
        expect(jobs).toEqual([
            {
                title: 'j1',
                salary: 1,
                equity: '0.1',
                companyhandle: "c1"
            },
            {
                title: 'j2',
                salary: 2,
                equity: '0.2',
                companyhandle: "c2"
            },
            {
                title: 'j3',
                salary: 3,
                equity: '0.3',
                companyhandle: "c3"
            }
        ]);
    })
});

describe('get', () => {
    test("works", async () => {
        let j1 = await db.query(`SELECT id FROM jobs WHERE title = 'j1'`);
        let id = j1.rows[0].id;

        let job = await Job.get(id);
        delete job.id;

        expect(job).toEqual({
            title: 'j1',
            salary: 1,
            equity: '0.1',
            companyhandle: "c1"
        });
    });

    test("not found if no such job", async () => {
        try {
            await Job.get(0);
            fail();
        } catch (error) {
            console.log(error);
            expect(error instanceof NotFoundError).toBeTruthy();
        }
    });
})

describe('update', () => {
    const updateData = {
        title: "New",
        salary: 10,
        equity: 0.11,
    }

    test('works', async () => {
        let j1 = await db.query(`SELECT id FROM jobs WHERE title = 'j1'`);
        let id = j1.rows[0].id;

        let job = await Job.update(id, updateData);
        expect(job).toEqual({
            id,
            title: "New",
            salary: 10,
            equity: '0.11',
            companyhandle: "c1"
        });

        const result = await db.query(
            `SELECT title, salary, equity, company_handle AS companyHandle
            FROM jobs
            WHERE title = 'New'`
        );
        expect(result.rows).toEqual([{
            title: "New",
            salary: 10,
            equity: '0.11',
            companyhandle: 'c1'
        }]);
    });

    test('works: null field', async () => {
        const updateData = {
            title: "New",
            salary: 1,
            equity: null
        };

        let j1 = await db.query(`SELECT id FROM jobs WHERE title = 'j1';`);
        let id = j1.rows[0].id;

        console.log(id);

        let job = await Job.update(id, updateData);
        expect(job).toEqual({
            id,
            ...updateData,
            companyhandle: 'c1'
        });

        const result = await db.query(
            `SELECT id, title, salary, equity, company_handle AS companyhandle
            FROM jobs
            WHERE id = ${id}`
        );
        expect(result.rows).toEqual([{
            id,
            ...updateData,
            companyhandle: 'c1'
        }]);
    });

    test("not found if no such job", async () => {
        try {
            await Job.update(0, updateData)
            fail();
        } catch (error) {
            console.log(error);
            expect(error instanceof NotFoundError).toBeTruthy();
        }
    });

    test('bad request no data', async () => {
        try {
            await Job.update('j1', {});
            fail();
        } catch (error) {
            expect(error instanceof BadRequestError).toBeTruthy();
        }
    });
});

describe('remove', () => {
    test('works', async () => {
        let j1 = await db.query(`SELECT id FROM jobs WHERE title = 'j1'`);
        let id = j1.rows[0].id;

        await Job.remove(id);
        const res = await db.query(
            `SELECT title FROM jobs WHERE id = ${id}`
        );
        expect(res.rows.length).toEqual(0);
    });

    test('not found if no such job', async () => {
        try {
            await Job.remove(0);
            fail();
        } catch (error) {
            expect(error instanceof NotFoundError).toBeTruthy();
        }
    });
});
