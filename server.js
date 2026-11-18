require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;
const API_KEY = process.env.MPGI_API_KEY || 'dev-mpgi-key-123';
const DB_PATH = path.join(__dirname, 'data', 'db.json');

app.use(cors());
app.use(express.json({ limit: '15mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// Clean Initial Database — Zero fake names, Zero pre-filled dummy data
const DEFAULT_DB = {
  hostelers: [],
  registrationRequests: [],
  applications: [],
  notices: [],
  timetable: [],
  messMenu: {},
  attendanceRecords: {}
};

function readDb() {
  fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
  if (!fs.existsSync(DB_PATH)) {
    fs.writeFileSync(DB_PATH, JSON.stringify(DEFAULT_DB, null, 2));
  }
  try {
    return JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
  } catch (e) {
    return DEFAULT_DB;
  }
}

function writeDb(data) {
  fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

// API Key Middleware
function requireApiKey(req, res, next) {
  const clientKey = req.header('x-api-key');
  if (!clientKey || clientKey !== API_KEY) {
    return res.status(401).json({ error: 'Unauthorized: Invalid or missing x-api-key header.' });
  }
  next();
}

// Health check & Server / DB Connection telemetry
app.get('/api/health', (req, res) => {
  const db = readDb();
  res.json({
    status: 'ok',
    service: "MPGI Hosteler's ERP API",
    version: '3.1.0',
    timestamp: new Date().toISOString(),
    stats: {
      hostelers: (db.hostelers || []).length,
      registrationRequests: (db.registrationRequests || []).length,
      timetable: (db.timetable || []).length,
      notices: (db.notices || []).length,
      applications: (db.applications || []).length,
      messMenuDays: Object.keys(db.messMenu || {}).length
    }
  });
});

// Auth endpoint — Student types Roll No & Password; HOD enters Admin password
app.post('/api/auth/login', requireApiKey, (req, res) => {
  const { role, username, rollNo, password, wing } = req.body;
  const db = readDb();

  if (role === 'student') {
    const inputRoll = (rollNo || username || '').trim().toLowerCase();
    const student = (db.hostelers || []).find(h =>
      ((h.rollNo && h.rollNo.trim().toLowerCase() === inputRoll) ||
       (h.id && h.id.trim().toLowerCase() === inputRoll)) &&
      h.password === password
    );

    if (!student) {
      // Check if registration is still pending
      const pending = (db.registrationRequests || []).find(r =>
        r.rollNo && r.rollNo.trim().toLowerCase() === inputRoll
      );
      if (pending) {
        return res.status(403).json({
          error: 'Registration pending HOD approval',
          message: `Your registration (ID: ${pending.id}) has been submitted, but room allotment is currently pending HOD verification.`
        });
      }
      return res.status(401).json({ error: 'Invalid Roll Number or Password. Please check your credentials or register below.' });
    }

    return res.json({ role: 'student', user: student });
  }

  if (role === 'hod') {
    if (password !== 'admin123') {
      return res.status(401).json({ error: 'Invalid HOD / Dean administrative password.' });
    }
    return res.json({ role: 'hod', wing: wing || 'Male' });
  }

  res.status(400).json({ error: 'Invalid login role specified.' });
});

// Student Registrations & Fee Receipts
app.get('/api/registrations', requireApiKey, (req, res) => {
  const db = readDb();
  if (!db.registrationRequests) db.registrationRequests = [];
  const { wing } = req.query;
  const list = wing ? db.registrationRequests.filter(r => r.wing === wing) : db.registrationRequests;
  res.json(list);
});

app.post('/api/registrations', requireApiKey, (req, res) => {
  const db = readDb();
  if (!db.registrationRequests) db.registrationRequests = [];

  const item = {
    id: 'REG-2026-' + Math.floor(1000 + Math.random() * 9000),
    status: 'Pending HOD Approval',
    submittedAt: new Date().toLocaleString(),
    allottedRoom: '',
    allottedBed: '',
    hodRemark: '',
    ...req.body
  };

  db.registrationRequests.unshift(item);
  writeDb(db);
  res.status(201).json(item);
});

// HOD verifies fee receipt and allots room
app.post('/api/registrations/:id/approve', requireApiKey, (req, res) => {
  const db = readDb();
  if (!db.registrationRequests) db.registrationRequests = [];
  if (!db.hostelers) db.hostelers = [];

  const reg = db.registrationRequests.find(r => r.id === req.params.id);
  if (!reg) return res.status(404).json({ error: 'Registration request not found.' });

  const { roomNo, bedNo, block, hostelName, roommates, hodRemark } = req.body;
  reg.status = 'Approved';
  reg.allottedRoom = roomNo || 'A-101';
  reg.allottedBed = bedNo || 'Bed 1';
  reg.hodRemark = hodRemark || 'Fee receipt verified. Room allotted.';

  // Automatically create active hosteler record
  const newHosteler = {
    id: 'STU-' + (reg.wing === 'Female' ? 'F-' : 'M-') + Math.floor(100 + Math.random() * 900),
    rollNo: reg.rollNo,
    name: reg.name,
    wing: reg.wing,
    hostelName: hostelName || reg.hostelName || (reg.wing === 'Female' ? "Gargi Girls' Hostel" : "Vivekananda Boys' Hostel"),
    block: block || (reg.wing === 'Female' ? 'Wing C — 1st Floor' : 'Block A — 1st Floor'),
    roomNo: reg.allottedRoom,
    bedNo: reg.allottedBed,
    roommates: roommates || [],
    allotted: true,
    allotmentDate: new Date().toISOString().slice(0, 10),
    course: reg.course || reg.branch || 'B.Tech',
    mobile: reg.mobile,
    email: reg.email,
    parentName: reg.parentName || 'Parent / Guardian',
    parentContact: reg.parentContact || reg.mobile,
    warden: reg.wing === 'Female' ? 'Prof. Meenakshi Joshi (+91 94150 77889)' : 'Dr. S. K. Tiwari (+91 94150 11223)',
    messStatus: 'Active (Paid)',
    messCardNo: 'MPGI-MESS-2026-' + reg.allottedRoom,
    password: reg.password || '123'
  };

  const existingIdx = db.hostelers.findIndex(h => h.rollNo.toLowerCase() === reg.rollNo.toLowerCase());
  if (existingIdx !== -1) {
    db.hostelers[existingIdx] = newHosteler;
  } else {
    db.hostelers.push(newHosteler);
  }

  writeDb(db);
  res.json({ success: true, registration: reg, hosteler: newHosteler });
});

app.post('/api/registrations/:id/reject', requireApiKey, (req, res) => {
  const db = readDb();
  if (!db.registrationRequests) db.registrationRequests = [];
  const reg = db.registrationRequests.find(r => r.id === req.params.id);
  if (!reg) return res.status(404).json({ error: 'Registration request not found.' });
  reg.status = 'Rejected';
  reg.hodRemark = req.body.hodRemark || 'Fee receipt unverified or invalid.';
  writeDb(db);
  res.json({ success: true, registration: reg });
});

// Hostelers
app.get('/api/hostelers', requireApiKey, (req, res) => {
  const db = readDb();
  const { wing } = req.query;
  const list = wing ? (db.hostelers || []).filter(h => h.wing === wing) : (db.hostelers || []);
  res.json(list);
});

app.post('/api/hostelers', requireApiKey, (req, res) => {
  const db = readDb();
  if (!db.hostelers) db.hostelers = [];
  const item = {
    id: 'STU-' + (req.body.wing === 'Female' ? 'F-' : 'M-') + Math.floor(100 + Math.random() * 900),
    allotted: Boolean(req.body.roomNo && req.body.roomNo.toLowerCase() !== 'unassigned'),
    allotmentDate: new Date().toISOString().slice(0, 10),
    roommates: req.body.roommates || [],
    messStatus: 'Active (Paid)',
    password: req.body.password || '123',
    ...req.body
  };
  db.hostelers.push(item);
  writeDb(db);
  res.status(201).json(item);
});

app.put('/api/hostelers/:id', requireApiKey, (req, res) => {
  const db = readDb();
  if (!db.hostelers) db.hostelers = [];
  const idx = db.hostelers.findIndex(h => h.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Hosteler not found.' });
  db.hostelers[idx] = { ...db.hostelers[idx], ...req.body };
  writeDb(db);
  res.json(db.hostelers[idx]);
});

app.put('/api/hostelers/:id/allot', requireApiKey, (req, res) => {
  const db = readDb();
  if (!db.hostelers) db.hostelers = [];
  const idx = db.hostelers.findIndex(h => h.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Hosteler not found.' });

  const { roomNo, bedNo, block, hostelName, roommates, messStatus } = req.body;
  if (roomNo) db.hostelers[idx].roomNo = roomNo;
  if (bedNo) db.hostelers[idx].bedNo = bedNo;
  if (block) db.hostelers[idx].block = block;
  if (hostelName) db.hostelers[idx].hostelName = hostelName;
  if (roommates !== undefined) db.hostelers[idx].roommates = Array.isArray(roommates) ? roommates : [roommates];
  if (messStatus) db.hostelers[idx].messStatus = messStatus;
  db.hostelers[idx].allotted = Boolean(db.hostelers[idx].roomNo && db.hostelers[idx].roomNo.toLowerCase() !== 'unassigned');
  db.hostelers[idx].allotmentDate = new Date().toISOString().slice(0, 10);

  writeDb(db);
  res.json({ success: true, hosteler: db.hostelers[idx] });
});

// Timetable (Uploaded by HOD only)
app.get('/api/timetable', requireApiKey, (req, res) => {
  const db = readDb();
  res.json(db.timetable || []);
});

app.post('/api/timetable', requireApiKey, (req, res) => {
  const db = readDb();
  if (!db.timetable) db.timetable = [];
  const entry = { id: 'TT-' + Date.now(), ...req.body };
  db.timetable.push(entry);
  writeDb(db);
  res.status(201).json(entry);
});

app.delete('/api/timetable/:id', requireApiKey, (req, res) => {
  const db = readDb();
  if (!db.timetable) db.timetable = [];
  db.timetable = db.timetable.filter(t => t.id !== req.params.id);
  writeDb(db);
  res.json({ deleted: true });
});

// Mess Menu (Uploaded by HOD only)
app.get('/api/mess-menu', requireApiKey, (req, res) => {
  const db = readDb();
  res.json(db.messMenu || {});
});

app.put('/api/mess-menu/:day', requireApiKey, (req, res) => {
  const db = readDb();
  if (!db.messMenu) db.messMenu = {};
  const day = req.params.day;
  db.messMenu[day] = { ...(db.messMenu[day] || {}), ...req.body };
  writeDb(db);
  res.json({ success: true, day, menu: db.messMenu[day] });
});

// Applications (Leave / Outing / Room Shift)
app.get('/api/applications', requireApiKey, (req, res) => {
  const db = readDb();
  res.json(db.applications || []);
});

app.post('/api/applications', requireApiKey, (req, res) => {
  const db = readDb();
  if (!db.applications) db.applications = [];
  const appItem = {
    id: 'APP-2026-' + Math.floor(100 + Math.random() * 899),
    status: 'Pending',
    submittedAt: new Date().toLocaleString(),
    hodRemark: '',
    ...req.body
  };
  db.applications.unshift(appItem);
  writeDb(db);
  res.status(201).json(appItem);
});

app.patch('/api/applications/:id', requireApiKey, (req, res) => {
  const db = readDb();
  if (!db.applications) db.applications = [];
  const item = db.applications.find(a => a.id === req.params.id);
  if (!item) return res.status(404).json({ error: 'Application not found.' });
  if (req.body.status) item.status = req.body.status;
  if (req.body.hodRemark !== undefined) item.hodRemark = req.body.hodRemark;
  writeDb(db);
  res.json(item);
});

// Notices (Published by HOD only)
app.get('/api/notices', requireApiKey, (req, res) => {
  const db = readDb();
  res.json(db.notices || []);
});

app.post('/api/notices', requireApiKey, (req, res) => {
  const db = readDb();
  if (!db.notices) db.notices = [];
  const notice = { id: 'NOT-' + Date.now(), date: new Date().toISOString().slice(0, 10), ...req.body };
  db.notices.unshift(notice);
  writeDb(db);
  res.status(201).json(notice);
});

app.delete('/api/notices/:id', requireApiKey, (req, res) => {
  const db = readDb();
  if (!db.notices) db.notices = [];
  db.notices = db.notices.filter(n => n.id !== req.params.id);
  writeDb(db);
  res.json({ deleted: true });
});

// Attendance Records
app.get('/api/attendance', requireApiKey, (req, res) => {
  const db = readDb();
  res.json(db.attendanceRecords || {});
});

app.post('/api/attendance', requireApiKey, (req, res) => {
  const db = readDb();
  if (!db.attendanceRecords) db.attendanceRecords = {};
  const { date, records } = req.body;
  if (!date || !records) return res.status(400).json({ error: 'Missing date or records.' });
  db.attendanceRecords[date] = { ...(db.attendanceRecords[date] || {}), ...records };
  writeDb(db);
  res.json({ saved: true, date, records: db.attendanceRecords[date] });
});

app.listen(PORT, () => {
  console.log(`MPGI Hosteler's ERP server running on http://localhost:${PORT}`);
});
