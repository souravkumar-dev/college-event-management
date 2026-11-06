// API tests with an in-memory MongoDB (downloads a MongoDB binary the first time).
// Run:  npm test
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import mongoose from 'mongoose';
import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';

process.env.JWT_SECRET = 'test-secret';
process.env.NODE_ENV = 'test';
delete process.env.RESEND_API_KEY;

let app; let mongo; let User;
const day = (n) => { const d = new Date(); d.setDate(d.getDate() + n); return d.toISOString().slice(0, 10); };

before(async () => {
  mongo = await MongoMemoryServer.create();
  await mongoose.connect(mongo.getUri());
  app = (await import('../app.js')).default;
  User = (await import('../models/User.js')).default;
  await (await import('../models/Registration.js')).default.syncIndexes();
});
after(async () => { await mongoose.disconnect(); await mongo.stop(); });

const student = { name: 'Asha', email: 'asha@college.edu', password: 'secret12', rollNumber: 'R1', department: 'MCA', academicYear: '1st Year', phone: '9876543210' };
const student2 = { ...student, name: 'Bala', email: 'bala@college.edu', rollNumber: 'R2' };
const regBody = (eventId, s = student) => ({
  eventId, fullName: s.name, rollNumber: s.rollNumber, department: s.department, academicYear: s.academicYear, email: s.email, phone: s.phone, acceptTerms: 'true',
});
let sTok; let s2Tok; let oTok; let eventId;

test('student sign-up always creates a student', async () => {
  const res = await request(app).post('/api/auth/register').send({ ...student, role: 'organizer' });
  assert.equal(res.status, 201);
  assert.equal(res.body.user.role, 'student');
  assert.equal(res.body.user.password, undefined);
  sTok = res.body.token;
  s2Tok = (await request(app).post('/api/auth/register').send(student2)).body.token;
});

test('duplicate email is rejected', async () => {
  const res = await request(app).post('/api/auth/register').send(student);
  assert.equal(res.status, 409);
});

test('wrong password is rejected; correct password logs in', async () => {
  assert.equal((await request(app).post('/api/auth/login').send({ email: student.email, password: 'nope123' })).status, 401);
  assert.equal((await request(app).post('/api/auth/login').send({ email: student.email, password: student.password })).status, 200);
});

test('students cannot create events', async () => {
  const res = await request(app).post('/api/events').set('Authorization', `Bearer ${sTok}`).send({});
  assert.equal(res.status, 403);
});

test('organizer creates an event with 1 seat', async () => {
  await User.create({ name: 'Org', email: 'org@college.edu', password: 'secret12', role: 'organizer' });
  oTok = (await request(app).post('/api/auth/login').send({ email: 'org@college.edu', password: 'secret12' })).body.token;
  const res = await request(app).post('/api/events').set('Authorization', `Bearer ${oTok}`).send({
    eventName: 'Hackathon', category: 'Technical', eventType: 'Offline', date: day(10), time: '10:00 AM',
    venue: 'Lab 1', description: 'Code all day', image: 'https://example.com/a.jpg', maxParticipants: 1, registrationDeadline: day(5), highlights: ['Prizes'],
  });
  assert.equal(res.status, 201);
  assert.equal(res.body.availableSeats, 1);
  assert.equal(res.body.registrationOpen, true);
  eventId = res.body._id;
});

test('registration, duplicate check and capacity limit', async () => {
  const first = await request(app).post('/api/registrations').set('Authorization', `Bearer ${sTok}`).send(regBody(eventId));
  assert.equal(first.status, 201);
  assert.equal(first.body.status, 'pending');
  const dup = await request(app).post('/api/registrations').set('Authorization', `Bearer ${sTok}`).send(regBody(eventId));
  assert.equal(dup.status, 409);
  const full = await request(app).post('/api/registrations').set('Authorization', `Bearer ${s2Tok}`).send(regBody(eventId, student2));
  assert.equal(full.status, 400);
});

test('two students racing for the last seat: only one gets it', async () => {
  const ev = await request(app).post('/api/events').set('Authorization', `Bearer ${oTok}`).send({
    eventName: 'Race', category: 'Sports', eventType: 'Offline', date: day(10), time: '9 AM', venue: 'Ground',
    description: 'x', image: 'https://example.com/b.jpg', maxParticipants: 1, registrationDeadline: day(5),
  });
  const [a, b] = await Promise.all([
    request(app).post('/api/registrations').set('Authorization', `Bearer ${sTok}`).send(regBody(ev.body._id)),
    request(app).post('/api/registrations').set('Authorization', `Bearer ${s2Tok}`).send(regBody(ev.body._id, student2)),
  ]);
  assert.deepEqual([a.status, b.status].sort(), [201, 400]);
});

test('cancelling frees the seat for another student', async () => {
  const mine = await request(app).get('/api/registrations/my').set('Authorization', `Bearer ${sTok}`);
  const reg = mine.body.items.find((r) => r.eventId._id === eventId);
  assert.equal((await request(app).patch(`/api/registrations/${reg._id}/cancel`).set('Authorization', `Bearer ${sTok}`)).status, 200);
  const second = await request(app).post('/api/registrations').set('Authorization', `Bearer ${s2Tok}`).send(regBody(eventId, student2));
  assert.equal(second.status, 201);
});

test('organizer confirms a registration and dashboard counts match', async () => {
  const list = await request(app).get('/api/registrations').set('Authorization', `Bearer ${oTok}`);
  assert.equal(list.status, 200);
  const pending = list.body.items.find((r) => r.status === 'pending');
  const upd = await request(app).patch(`/api/registrations/${pending._id}/status`).set('Authorization', `Bearer ${oTok}`).send({ status: 'confirmed' });
  assert.equal(upd.body.status, 'confirmed');
  const dash = await request(app).get('/api/dashboard/organizer').set('Authorization', `Bearer ${oTok}`);
  assert.equal(dash.body.totalEvents, 2);
  assert.equal(dash.body.registrations.total, 3);
  assert.equal(dash.body.registrations.confirmed, 1);
  assert.equal(dash.body.registrations.cancelled, 1);
});

test('students cannot see all registrations', async () => {
  assert.equal((await request(app).get('/api/registrations').set('Authorization', `Bearer ${sTok}`)).status, 403);
});

test('save for later', async () => {
  assert.equal((await request(app).post(`/api/auth/saved/${eventId}`).set('Authorization', `Bearer ${sTok}`)).status, 200);
  const saved = await request(app).get('/api/auth/saved').set('Authorization', `Bearer ${sTok}`);
  assert.equal(saved.body.items.length, 1);
});
