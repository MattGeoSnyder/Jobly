"use strict";

const request = require("supertest");

const db = require("../db");
const app = require("../app");

const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  u1Token,
  u2Token
} = require("./_testCommon");
const { NotFoundError, BadRequestError, UnauthorizedError } = require("../expressError");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

describe("POST /jobs", () => {
    const newJob = {
        title: 'new',
        salary: 100000,
        equity: 0.1,
        companyHandle: "c1"
    };

    test('works for admin', async () => {
        const res = await request(app)
            .post('/jobs')
            .send(newJob)
            .set('authorization', `Bearer ${u1Token}`);

        expect(res.statusCode).toBe(201);
        
        delete res.body.job.id;
        expect(res.body).toEqual({ job:
            {
                title: 'new',
                salary: 100000,
                equity: '0.1',
                companyhandle: "c1"
            }
        });      
    });

    test('fails for is not admin', async () => {
        const res = await request(app)
            .post('/jobs')
            .send(newJob)
            .set('authorization', `Bearer ${u2Token}`);

        expect(res.statusCode).toBe(401); 
    });

    test('fails for no auth', async () => {
        const res = await request(app)
            .post('/jobs')
            .send(newJob);
            

        expect(res.statusCode).toBe(401); 
    });
});

describe('GET /jobs', () => {
    test('works for no auth', async () => {
        let res = await request(app).get('/jobs');
        expect(res.body).toEqual({ jobs: [
            {
                title: 'j1',
                salary: 1,
                equity: '0.1',
                companyhandle: 'c1'
            },
            {
                title: 'j2',
                salary: 2,
                equity: '0.2',
                companyhandle: 'c2'
            },
            {
                title: 'j3',
                salary: 3,
                equity: '0.3',
                companyhandle: 'c3'
            }
        ]})
    });

    test('works for filtering title', async () => {
        let res = await request(app).get('/jobs').send({title: 'j1'});
        expect(res.body).toEqual({ jobs: [
            {
                title: 'j1',
                salary: 1,
                equity: '0.1',
                companyhandle: 'c1'
            }
        ]});
    });

    test('works for filtering minSalary', async () => {
        let res = await request(app).get('/jobs').send({minSalary: 2});
        expect(res.body).toEqual({ jobs: [
            {
                title: 'j2',
                salary: 2,
                equity: '0.2',
                companyhandle: 'c2'
            },
            {
                title: 'j3',
                salary: 3,
                equity: '0.3',
                companyhandle: 'c3'
            }
        ]});
    });

    test('works for filtering equity', async () => {
        let res = await request(app).get('/jobs').send({equity: true});
        expect(res.body).toEqual({ jobs: [
            {
                title: 'j1',
                salary: 1,
                equity: '0.1',
                companyhandle: 'c1'
            },
            {
                title: 'j2',
                salary: 2,
                equity: '0.2',
                companyhandle: 'c2'
            },
            {
                title: 'j3',
                salary: 3,
                equity: '0.3',
                companyhandle: 'c3'
            }
        ]});
    })

    test('works for login', async () => {
        let res = await request(app).get('/jobs')
            .set('authorization', `Bearer ${u2Token}`);
        expect(res.body).toEqual({ jobs: [
            {
                title: 'j1',
                salary: 1,
                equity: '0.1',
                companyhandle: 'c1'
            },
            {
                title: 'j2',
                salary: 2,
                equity: '0.2',
                companyhandle: 'c2'
            },
            {
                title: 'j3',
                salary: 3,
                equity: '0.3',
                companyhandle: 'c3'
            }
        ]});
    });

    test('works for admin', async () => {
        let res = await request(app).get('/jobs')
            .set('authorization', `Bearer ${u1Token}`);
        expect(res.body).toEqual({ jobs: [
            {
                title: 'j1',
                salary: 1,
                equity: '0.1',
                companyhandle: 'c1'
            },
            {
                title: 'j2',
                salary: 2,
                equity: '0.2',
                companyhandle: 'c2'
            },
            {
                title: 'j3',
                salary: 3,
                equity: '0.3',
                companyhandle: 'c3'
            }
        ]});
    });
});

describe('GET /jobs/:id', () => {

    test('works for no auth', async () => {
        let dbRes = await db.query(`SELECT * FROM jobs WHERE title = 'j1'`);
        let j1 = dbRes.rows[0];
        let id = j1.id;

        let res = await request(app).get(`/jobs/${id}`);
        expect(res.body).toEqual({ job: {
            id,
            title: j1.title,
            salary: j1.salary,
            equity: j1.equity,
            companyhandle: j1.company_handle 
        }});
    });

    test('works for login', async () => {
        let dbRes = await db.query(`SELECT * FROM jobs WHERE title = 'j1'`);
        let j1 = dbRes.rows[0];
        let id = j1.id;

        let res = await request(app).get(`/jobs/${id}`)
            .set('authorization', `$Bearer ${u2Token}`);
        expect(res.body).toEqual({ job: {
            id,
            title: j1.title,
            salary: j1.salary,
            equity: j1.equity,
            companyhandle: j1.company_handle 
        }});
    });

    test('works for auth', async () => {
        let dbRes = await db.query(`SELECT * FROM jobs WHERE title = 'j1'`);
        let j1 = dbRes.rows[0];
        let id = j1.id;

        let res = await request(app).get(`/jobs/${id}`)
            .set('authorization', `$Bearer ${u1Token}`);
        expect(res.body).toEqual({ job: {
            id,
            title: j1.title,
            salary: j1.salary,
            equity: j1.equity,
            companyhandle: j1.company_handle 
        }});
    });

    test('fails for invalid id', async () => {
        try {
            let res = await request(app).get(0);
            expect(res.statusCode).toBe(404);
            fail();
        } catch (error) {
            expect(error instanceof NotFoundError);
        }
    });
});

describe('PATCH /jobs/id', () => {
    test('fails if not auth', async () => {
        let dbRes = await db.query(`SELECT * FROM jobs WHERE title = 'j1'`);
        let j1 = dbRes.rows[0];
        let id = j1.id;

        try {
            let res = await request(app).patch(`/jobs/${id}`);
            expect(res.statusCode).toBe(401);
            fail();
        } catch (error) {
            expect(error instanceof UnauthorizedError);
        }
    });

    test('fails if not admin', async () => {
        let dbRes = await db.query(`SELECT * FROM jobs WHERE title = 'j1'`);
        let j1 = dbRes.rows[0];
        let id = j1.id;

        try {
            let res = await request(app).patch(`/jobs/${id}`)
                .send('authorization', `Bearer ${u2Token}`);
            expect(res.statusCode).toBe(401);
            fail();
        } catch (error) {
            expect(error instanceof UnauthorizedError);
        }
    });

    test('works if is admin', async () => {
        let dbRes = await db.query(`SELECT * FROM jobs WHERE title = 'j1'`);
        let j1 = dbRes.rows[0];
        let id = j1.id;

        let update = {...j1};
        delete update.id;
        delete update.company_handle;
        let equity = Number(update.equity);

        update.title = 'new';
        update.equity = equity;

        let res = await request(app).patch(`/jobs/${id}`)
            .send(update)
            .set('authorization', `Bearer ${u1Token}`);
        expect(res.body).toEqual({ job: 
            {
                id,
                title: 'new',
                salary: j1.salary,
                equity: j1.equity,
                companyhandle: j1.company_handle
            }    
        });
    });

    test('fails if invalid id', async () => {
        let dbRes = await db.query(`SELECT * FROM jobs WHERE title = 'j1'`);
        let j1 = dbRes.rows[0];
        let id = j1.id;

        let update = {...j1};
        delete update.id;
        delete update.company_handle;
        let equity = Number(update.equity);

        update.title = 'new';
        update.equity = equity;

        try {
            let res = await request(app).patch('/jobs/0')
                .send(update)
                .set(`authorization`, `Bearer ${u1Token}`);
            expect(res.statusCode).toBe(404);
        } catch (error) {
            expect(error instanceof NotFoundError).toBeTruthy();
        }
    });

    test('fails if invalid data (too little data)', async () => {
        let dbRes = await db.query(`SELECT * FROM jobs WHERE title = 'j1'`);
        let j1 = dbRes.rows[0];
        let id = j1.id;

        let update = {...j1};
        delete update.id;
        delete update.company_handle;
        delete update.salary;
        let equity = Number(update.equity);

        
        update.title = 'new';
        update.equity = equity;

        try {
            let res = await request(app).patch(`/jobs/${id}`)
                .send(update)
                .set(`authorization`, `Bearer ${u1Token}`);
            expect(res.statusCode).toBe(400);
        } catch (error) {
            expect(error instanceof BadRequestError).toBeTruthy();
        }

    });

    test('fails if invalid data (too much data)', async () => {
        let dbRes = await db.query(`SELECT * FROM jobs WHERE title = 'j1'`);
        let j1 = dbRes.rows[0];
        let id = j1.id;

        let update = {...j1};
        delete update.id;
        delete update.company_handle;
        let equity = Number(update.equity);

        
        update.title = 'new';
        update.equity = equity;
        update.extra = "NOOOOOOO!";

        try {
            let res = await request(app).patch(`/jobs/${id}`)
                .send(update)
                .set(`authorization`, `Bearer ${u1Token}`);
            expect(res.statusCode).toBe(400);
        } catch (error) {
            expect(error instanceof BadRequestError).toBeTruthy();
        }

    });
});

describe('DELETE /jobs/:id', () => {
    test('fails if no login', async () => {
        let dbRes = await db.query(`SELECT * FROM jobs WHERE title = 'j1'`);
        let j1 = dbRes.rows[0];
        let id = j1.id;

        try {
            let res = await request(app).delete(`/jobs/${id}`);
            expect(res.statusCode).toBe(401);
        } catch (error) {
            expect(error instanceof UnauthorizedError).toBeTruthy();
        }
    });

    test('fails if no auth', async () => {
        let dbRes = await db.query(`SELECT * FROM jobs WHERE title = 'j1'`);
        let j1 = dbRes.rows[0];
        let id = j1.id;

        try {
            let res = await request(app).delete(`/jobs/${id}`)
                .set('authorization', `Bearer ${u2Token}`);
            expect(res.statusCode).toBe(401);
        } catch (error) {
            expect(error instanceof UnauthorizedError).toBeTruthy();
        }
    });

    test('fails if id not valid', async () => {
        try {
            let res = await request(app).delete(`/jobs/0`)
                .set('authorization', `Bearer ${u1Token}`);
            expect(res.statusCode).toBe(404);
        } catch (error) {
            expect(error instanceof NotFoundError).toBeTruthy();
        }
    })

    test('works', async () => {
        let dbRes = await db.query(`SELECT * FROM jobs WHERE title = 'j1'`);
        let j1 = dbRes.rows[0];
        let id = j1.id;

        let res = await request(app).delete(`/jobs/${id}`)
            .set('authorization', `Bearer ${u1Token}`);
        expect(res.body).toEqual({ deleted: `${id}`});

    });
})