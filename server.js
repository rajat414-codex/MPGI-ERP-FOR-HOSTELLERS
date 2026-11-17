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
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Default Initial Database with Full Institutional Hosteler & Mess Data
const DEFAULT_DB = {
  hostelers: [
    {
      id: 'STU-M-101',
      rollNo: 'MPGI/24/CS/042',
      name: 'Aarav Sharma',
      wing: 'Male',
      hostelName: "Vivekananda Boys' Hostel",
      block: 'Block A — 2nd Floor',
      roomNo: 'A-204',
      bedNo: 'Bed 1 (Window Side)',
      roommates: ['Rohan Verma (MPGI/24/CS/058)'],
      allotted: true,
      allotmentDate: '2026-08-01',
      course: 'B.Tech CSE — 2nd Year',
      mobile: '+91 98765 43210',
      email: 'aarav.sharma@mpgi.edu.in',
      parentName: 'Rajesh Sharma',
      parentContact: '+91 98112 33445',
      warden: 'Dr. S. K. Tiwari (+91 94150 11223)',
      messStatus: 'Active (Paid)',
      messCardNo: 'MPGI-MESS-2026-A204',
      password: '123'
    },
    {
      id: 'STU-M-102',
      rollNo: 'MPGI/24/CS/058',
      name: 'Rohan Verma',
      wing: 'Male',
      hostelName: "Vivekananda Boys' Hostel",
      block: 'Block A — 2nd Floor',
      roomNo: 'A-204',
      bedNo: 'Bed 2 (Door Side)',
      roommates: ['Aarav Sharma (MPGI/24/CS/042)'],
      allotted: true,
      allotmentDate: '2026-08-01',
      course: 'B.Tech CSE — 2nd Year',
      mobile: '+91 98234 55671',
      email: 'rohan.verma@mpgi.edu.in',
      parentName: 'Mahesh Verma',
      parentContact: '+91 98234 11002',
      warden: 'Dr. S. K. Tiwari (+91 94150 11223)',
      messStatus: 'Active (Paid)',
      messCardNo: 'MPGI-MESS-2026-A204B',
      password: '123'
    },
    {
      id: 'STU-M-103',
      rollNo: 'MPGI/23/ME/019',
      name: 'Vikram Singh',
      wing: 'Male',
      hostelName: "Vivekananda Boys' Hostel",
      block: 'Block B — 1st Floor',
      roomNo: 'B-108',
      bedNo: 'Bed 1 (Balcony Side)',
      roommates: ['Kunal Mishra (MPGI/23/ME/024)'],
      allotted: true,
      allotmentDate: '2026-08-05',
      course: 'B.Tech ME — 3rd Year',
      mobile: '+91 97950 22314',
      email: 'vikram.singh@mpgi.edu.in',
      parentName: 'Dharmendra Singh',
      parentContact: '+91 94501 88776',
      warden: 'Dr. S. K. Tiwari (+91 94150 11223)',
      messStatus: 'Active (Paid)',
      messCardNo: 'MPGI-MESS-2026-B108',
      password: '123'
    },
    {
      id: 'STU-M-104',
      rollNo: 'MPGI/25/EC/011',
      name: 'Aditya Gupta',
      wing: 'Male',
      hostelName: "Vivekananda Boys' Hostel",
      block: 'Pending Allotment',
      roomNo: 'Unassigned',
      bedNo: '-',
      roommates: [],
      allotted: false,
      allotmentDate: '-',
      course: 'B.Tech ECE — 1st Year',
      mobile: '+91 99180 65432',
      email: 'aditya.gupta@mpgi.edu.in',
      parentName: 'Suresh Gupta',
      parentContact: '+91 94151 99881',
      warden: 'Dr. S. K. Tiwari (+91 94150 11223)',
      messStatus: 'Pending Verification',
      messCardNo: 'Pending',
      password: '123'
    },
    {
      id: 'STU-F-201',
      rollNo: 'MPGI/24/CS/015',
      name: 'Ananya Srivastava',
      wing: 'Female',
      hostelName: "Gargi Girls' Hostel",
      block: 'Wing C — 1st Floor',
      roomNo: 'C-105',
      bedNo: 'Bed 1 (Window Side)',
      roommates: ['Priya Patel (MPGI/24/IT/031)'],
      allotted: true,
      allotmentDate: '2026-08-01',
      course: 'B.Tech CSE — 2nd Year',
      mobile: '+91 98390 12345',
      email: 'ananya.srivastava@mpgi.edu.in',
      parentName: 'Alok Srivastava',
      parentContact: '+91 94152 44556',
      warden: 'Prof. Meenakshi Joshi (+91 94150 77889)',
      messStatus: 'Active (Paid)',
      messCardNo: 'MPGI-MESS-2026-C105A',
      password: '123'
    },
    {
      id: 'STU-F-202',
      rollNo: 'MPGI/24/IT/031',
      name: 'Priya Patel',
      wing: 'Female',
      hostelName: "Gargi Girls' Hostel",
      block: 'Wing C — 1st Floor',
      roomNo: 'C-105',
      bedNo: 'Bed 2 (Door Side)',
      roommates: ['Ananya Srivastava (MPGI/24/CS/015)'],
      allotted: true,
      allotmentDate: '2026-08-01',
      course: 'B.Tech IT — 2nd Year',
      mobile: '+91 94503 66789',
      email: 'priya.patel@mpgi.edu.in',
      parentName: 'Mukesh Patel',
      parentContact: '+91 98380 99112',
      warden: 'Prof. Meenakshi Joshi (+91 94150 77889)',
      messStatus: 'Active (Paid)',
      messCardNo: 'MPGI-MESS-2026-C105B',
      password: '123'
    },
    {
      id: 'STU-F-203',
      rollNo: 'MPGI/23/EC/009',
      name: 'Riya Sen',
      wing: 'Female',
      hostelName: "Gargi Girls' Hostel",
      block: 'Wing D — Ground Floor',
      roomNo: 'D-012',
      bedNo: 'Bed 1 (Single Occupancy)',
      roommates: [],
      allotted: true,
      allotmentDate: '2026-08-03',
      course: 'B.Tech ECE — 3rd Year',
      mobile: '+91 98890 44321',
      email: 'riya.sen@mpgi.edu.in',
      parentName: 'Debashis Sen',
      parentContact: '+91 94155 33221',
      warden: 'Prof. Meenakshi Joshi (+91 94150 77889)',
      messStatus: 'Active (Paid)',
      messCardNo: 'MPGI-MESS-2026-D012',
      password: '123'
    }
  ],
  
  registrationRequests: [
    {
      id: 'REG-2026-104',
      name: 'Aditya Gupta',
      rollNo: 'MPGI/25/EC/011',
      branch: 'Electronics & Communication Engg (ECE)',
      course: 'B.Tech ECE — 1st Year',
      wing: 'Male',
      hostelName: "Vivekananda Boys' Hostel",
      roomPref: 'Double Sharing',
      mobile: '+91 99180 65432',
      email: 'aditya.gupta@mpgi.edu.in',
      parentName: 'Suresh Gupta',
      parentContact: '+91 94151 99881',
      receiptFileName: 'MPGI_Hostel_Fee_Receipt_2026_Aditya.pdf',
      receiptFileType: 'application/pdf',
      receiptFileSize: '245 KB',
      receiptDataUrl: '',
      utrNo: 'SBI-UTR-9872145561',
      amount: '₹68,500 (Annual Room Allotment + Mess Deposit)',
      status: 'Pending HOD Approval',
      submittedAt: '2026-11-17 02:45 PM',
      password: '123',
      allottedRoom: '',
      allottedBed: '',
      hodRemark: ''
    },
    {
      id: 'REG-2026-204',
      name: 'Megha Saxena',
      rollNo: 'MPGI/25/CS/088',
      branch: 'Computer Science & Engineering (CSE)',
      course: 'B.Tech CSE — 1st Year',
      wing: 'Female',
      hostelName: "Gargi Girls' Hostel",
      roomPref: 'Double Sharing (Window Side)',
      mobile: '+91 98399 77112',
      email: 'megha.saxena@mpgi.edu.in',
      parentName: 'Ramesh Saxena',
      parentContact: '+91 94150 66221',
      receiptFileName: 'Hostel_Fee_Challan_Megha.jpg',
      receiptFileType: 'image/jpeg',
      receiptFileSize: '412 KB',
      receiptDataUrl: '',
      utrNo: 'PNB-CHALLAN-4458921',
      amount: '₹68,500 (Full Year Hostel + Mess Charge)',
      status: 'Pending HOD Approval',
      submittedAt: '2026-11-17 04:10 PM',
      password: '123',
      allottedRoom: '',
      allottedBed: '',
      hodRemark: ''
    }
  ],

  applications: [
    {
      id: 'APP-2026-081',
      studentId: 'STU-M-101',
      studentName: 'Aarav Sharma',
      rollNo: 'MPGI/24/CS/042',
      roomNo: 'A-204',
      wing: 'Male',
      type: 'Home Leave',
      subject: 'Weekend Home Visit — Family Function',
      fromDate: '2026-11-20',
      toDate: '2026-11-22',
      reason: 'Attending elder sister engagement ceremony at Lucknow. Parental consent confirmed.',
      status: 'Pending',
      submittedAt: '2026-11-17 10:15 AM',
      hodRemark: ''
    },
    {
      id: 'APP-2026-079',
      studentId: 'STU-F-201',
      studentName: 'Ananya Srivastava',
      rollNo: 'MPGI/24/CS/015',
      roomNo: 'C-105',
      wing: 'Female',
      type: 'Medical Leave',
      subject: 'Doctor Appointment & Dental Treatment',
      fromDate: '2026-11-15',
      toDate: '2026-11-16',
      reason: 'Scheduled root canal treatment at Regency Hospital Kanpur with parents.',
      status: 'Approved',
      submittedAt: '2026-11-14 04:30 PM',
      hodRemark: 'Approved. Produce medical fitness slip upon hostel re-entry.'
    }
  ],
  notices: [
    {
      id: 'NOT-101',
      title: 'Mandatory Biometric & Roll-Call Attendance at 9:00 PM',
      category: 'Discipline',
      wing: 'All',
      date: '2026-11-17',
      postedBy: 'Chief Hostel Dean, MPGI',
      content: 'Evening roll-call attendance will be recorded strictly at 9:00 PM daily. Students absent without approved leave application on ERP portal will be marked absent and parent alert SMS will be dispatched.'
    },
    {
      id: 'NOT-102',
      title: 'Mess Schedule & Winter Special Lunch Menu Announcement',
      category: 'Mess & Dining',
      wing: 'All',
      date: '2026-11-16',
      postedBy: 'Mess Committee In-charge',
      content: 'Winter special lunch timetable is now active. Lunch will be served daily between 01:00 PM and 02:15 PM in the Central Dining Hall. Sunday Feast includes Shahi Paneer, Pulao and Gulab Jamun.'
    },
    {
      id: 'NOT-103',
      title: 'Strict Gate Curfew & Silence Hours Notice',
      category: 'Rules & Safety',
      wing: 'All',
      date: '2026-11-15',
      postedBy: 'Warden Office',
      content: 'Main hostel gates will be locked strictly at 10:00 PM. No student is permitted outside the hostel premises after 10:00 PM without written approval from the Warden/HOD. Quiet study hours remain 09:30 PM to 11:30 PM.'
    }
  ],
  timetable: [
    { id: 'TT-1', category: 'Routine', time: '06:30 AM – 07:30 AM', activity: 'Morning PT / Yoga & Wake-Up Bell', days: 'Mon – Sat', location: 'Hostel Lawn & Gym', wing: 'All' },
    { id: 'TT-2', category: 'Mess',    time: '07:30 AM – 08:45 AM', activity: 'Breakfast (Mess)', days: 'Daily', location: 'Central Dining Hall', wing: 'All' },
    { id: 'TT-3', category: 'Academic',time: '09:00 AM – 01:00 PM', activity: 'Morning Academic Classes & Labs', days: 'Mon – Fri', location: 'Academic Blocks', wing: 'All' },
    { id: 'TT-4', category: 'Mess',    time: '01:00 PM – 02:15 PM', activity: 'Lunch Break & Dining (Mess)', days: 'Daily', location: 'Central Dining Hall', wing: 'All' },
    { id: 'TT-5', category: 'Academic',time: '02:15 PM – 04:45 PM', activity: 'Afternoon Practical / Project Sessions', days: 'Mon – Fri', location: 'Department Labs', wing: 'All' },
    { id: 'TT-6', category: 'Mess',    time: '05:00 PM – 05:45 PM', activity: 'Evening Tea & Refreshments', days: 'Daily', location: 'Central Dining Hall', wing: 'All' },
    { id: 'TT-7', category: 'Routine', time: '05:45 PM – 07:15 PM', activity: 'Outdoor Sports & Central Library Access', days: 'Daily', location: 'Sports Ground / Library', wing: 'All' },
    { id: 'TT-8', category: 'Mess',    time: '07:30 PM – 09:15 PM', activity: 'Dinner (Mess)', days: 'Daily', location: 'Central Dining Hall', wing: 'All' },
    { id: 'TT-9', category: 'Discipline', time: '09:15 PM – 09:45 PM', activity: 'Mandatory Hostel Roll-Call & Biometrics', days: 'Daily', location: 'Respective Hostel Blocks', wing: 'All' },
    { id: 'TT-10', category: 'Discipline', time: '10:00 PM Strictly', activity: 'Hostel Main Gate Curfew Locking', days: 'Daily', location: 'Main Entrance Gates', wing: 'All' },
    { id: 'TT-11', category: 'Routine', time: '10:00 PM – 06:00 AM', activity: 'Night Silence & Rest Hours', days: 'Daily', location: 'Hostel Rooms / Corridors', wing: 'All' }
  ],
  messMenu: {
    Monday: {
      breakfast: { time: '07:30 AM – 08:45 AM', items: 'Aloo Paratha, Fresh Curd, Mint Chutney, White Butter, Tea / Fresh Milk' },
      lunch:     { time: '01:00 PM – 02:15 PM', items: 'Rajma Masala (Punjabi Style), Steamed Jeera Rice, Tawa Roti, Boondi Raita, Green Salad, Gulab Jamun' },
      snacks:    { time: '05:00 PM – 05:45 PM', items: 'Hot Masala Chai with Osmania Biscuits & Roasted Masala Peanuts' },
      dinner:    { time: '07:30 PM – 09:15 PM', items: 'Dal Tadka, Aloo Gobhi Matar Sabzi, Hot Chapati, Steamed Rice, Rice Kheer' }
    },
    Tuesday: {
      breakfast: { time: '07:30 AM – 08:45 AM', items: 'Indori Veg Poha with Sev & Lemon, Boiled Eggs / Banana, Tea / Filter Coffee' },
      lunch:     { time: '01:00 PM – 02:15 PM', items: 'Kadhi Pakoda, Steamed Rice, Tawa Chapati, Aloo Jeera Dry Bhujia, Mix Pickle, Fried Papad' },
      snacks:    { time: '05:00 PM – 05:45 PM', items: 'Filter Coffee / Ginger Chai with Crispy Veg Samosa & Imli Chutney' },
      dinner:    { time: '07:30 PM – 09:15 PM', items: 'Sev Tamatar Sabzi, Yellow Moong Dal, Phulka Roti, Steamed Rice, Fruit Custard' }
    },
    Wednesday: {
      breakfast: { time: '07:30 AM – 08:45 AM', items: 'South Indian Masala Dosa / Idli Sambhar, Coconut & Tomato Chutney, Tea' },
      lunch:     { time: '01:00 PM – 02:15 PM', items: 'Amritsari Chole Masala, Ajwain Poori / Bhature, Vegetable Pulao, Sirka Onion Salad, Boondi Ladoo' },
      snacks:    { time: '05:00 PM – 05:45 PM', items: 'Special Adrak Chai with Crispy Paneer Bread Pakoda' },
      dinner:    { time: '07:30 PM – 09:15 PM', items: 'Kadhai Paneer / Egg Curry, Dal Fry, Hot Butter Roti, Basmati Rice, Crispy Jalebi' }
    },
    Thursday: {
      breakfast: { time: '07:30 AM – 08:45 AM', items: 'Stuffed Gobhi Paratha, Amul Butter, Mango Pickle, Bournvita Milk / Tea' },
      lunch:     { time: '01:00 PM – 02:15 PM', items: 'Dal Makhani (Slow Cooked), Kashmiri Dum Aloo, Hot Phulka Roti, Steamed Rice, Curd, Green Salad' },
      snacks:    { time: '05:00 PM – 05:45 PM', items: 'Lemon Tea / Milk with Crispy Mix Onion & Spinach Pakoda' },
      dinner:    { time: '07:30 PM – 09:15 PM', items: 'Arhar Dal Tadka, Seasonal Bhindi Masala, Tawa Roti, Rice, Sweet Vermicelli (Sewaiyan)' }
    },
    Friday: {
      breakfast: { time: '07:30 AM – 08:45 AM', items: 'Bedmi Puri with Aloo Rasedar, Suji Kesari Halwa, Masala Chai' },
      lunch:     { time: '01:00 PM – 02:15 PM', items: 'Paneer Butter Masala, Dhaba Dal Fry, Matar Pulao, Tandoori / Tawa Butter Roti, Roasted Papad, Cucumber Salad' },
      snacks:    { time: '05:00 PM – 05:45 PM', items: 'Hot Masala Chai with Crispy Veg Cutlets & Tomato Ketchup' },
      dinner:    { time: '07:30 PM – 09:15 PM', items: 'Malai Kofta / Chana Masala, Tawa Roti, Jeera Rice, Moong Dal Halwa' }
    },
    Saturday: {
      breakfast: { time: '07:30 AM – 08:45 AM', items: 'Mix Veg Rava Upma with Coconut Chutney, Bread Butter Jam, Fresh Milk / Tea' },
      lunch:     { time: '01:00 PM – 02:15 PM', items: 'Awadhi Veg Biryani / Tehri, Panchmel Dal, Boondi & Cucumber Raita, Roasted Papad, Rasgulla' },
      snacks:    { time: '05:00 PM – 05:45 PM', items: 'Cardamom Chai with Grilled Veggie Sandwich / Aloo Tikki' },
      dinner:    { time: '07:30 PM – 09:15 PM', items: 'Dal Palak, Aloo Shimla Mirch, Fresh Hot Chapati, Steamed Rice, Besan Ladoo' }
    },
    Sunday: {
      breakfast: { time: '08:00 AM – 09:30 AM', items: 'Sunday Special: Chole Bhature, Sweet Punjabi Lassi / Fresh Milk & Tea' },
      lunch:     { time: '01:00 PM – 02:30 PM', items: 'Royal Sunday Feast: Shahi Paneer, Dal Maharani, Jeera Rice, Missi & Butter Roti, Gulab Jamun & Vanilla Ice Cream' },
      snacks:    { time: '05:00 PM – 06:00 PM', items: 'Special Cold Coffee / Hot Masala Chai with Bakery Cookies' },
      dinner:    { time: '07:30 PM – 09:30 PM', items: 'Mix Vegetable Korma, Yellow Tadka Dal, Butter Chapati, Peas Pulao, Semiya Kheer' }
    }
  },
  attendanceRecords: {
    '2026-11-17': { 'STU-M-101': 'Present', 'STU-M-102': 'Present', 'STU-M-103': 'Present', 'STU-M-104': 'Absent', 'STU-F-201': 'Present', 'STU-F-202': 'Present', 'STU-F-203': 'Present' },
    '2026-11-16': { 'STU-M-101': 'Present', 'STU-M-102': 'Present', 'STU-M-103': 'Leave',   'STU-M-104': 'Present', 'STU-F-201': 'Present', 'STU-F-202': 'Absent',  'STU-F-203': 'Present' },
    '2026-11-15': { 'STU-M-101': 'Present', 'STU-M-102': 'Absent',  'STU-M-103': 'Present', 'STU-M-104': 'Present', 'STU-F-201': 'Present', 'STU-F-202': 'Present', 'STU-F-203': 'Leave' },
    '2026-11-14': { 'STU-M-101': 'Present', 'STU-M-102': 'Present', 'STU-M-103': 'Present', 'STU-M-104': 'Present', 'STU-F-201': 'Present', 'STU-F-202': 'Present', 'STU-F-203': 'Present' },
    '2026-11-13': { 'STU-M-101': 'Leave',   'STU-M-102': 'Present', 'STU-M-103': 'Present', 'STU-M-104': 'Present', 'STU-F-201': 'Present', 'STU-F-202': 'Present', 'STU-F-203': 'Present' },
    '2026-11-12': { 'STU-M-101': 'Present', 'STU-M-102': 'Present', 'STU-M-103': 'Present', 'STU-M-104': 'Absent', 'STU-F-201': 'Present', 'STU-F-202': 'Present', 'STU-F-203': 'Present' }
  }
};

function readDb() {
  fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
  if (!fs.existsSync(DB_PATH)) {
    fs.writeFileSync(DB_PATH, JSON.stringify(DEFAULT_DB, null, 2));
  }
  return JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
}

function writeDb(data) {
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

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: "MPGI Hosteler's ERP API", version: '2.0.0' });
});

// Auth endpoint
app.post('/api/auth/login', requireApiKey, (req, res) => {
  const { role, studentId, wing, password } = req.body;
  const db = readDb();
  if (role === 'student') {
    const student = db.hostelers.find(h => h.id === studentId && h.password === password);
    if (!student) return res.status(401).json({ error: 'Invalid student credentials.' });
    return res.json({ role: 'student', user: student });
  }
  if (role === 'hod') {
    if (password !== 'admin123') return res.status(401).json({ error: 'Invalid HOD password.' });
    return res.json({ role: 'hod', wing: wing || 'Male' });
  }
  res.status(400).json({ error: 'Invalid role.' });
});

// Hostelers
app.get('/api/hostelers', requireApiKey, (req, res) => {
  const db = readDb();
  const { wing } = req.query;
  const list = wing ? db.hostelers.filter(h => h.wing === wing) : db.hostelers;
  res.json(list);
});

app.post('/api/hostelers', requireApiKey, (req, res) => {
  const db = readDb();
  const item = {
    id: 'STU-' + (req.body.wing === 'Female' ? 'F-' : 'M-') + Date.now().toString().slice(-4),
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
  const idx = db.hostelers.findIndex(h => h.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Hosteler not found.' });
  db.hostelers[idx] = { ...db.hostelers[idx], ...req.body };
  writeDb(db);
  res.json(db.hostelers[idx]);
});

// Dedicated Room Allotment Endpoint
app.put('/api/hostelers/:id/allot', requireApiKey, (req, res) => {
  const db = readDb();
  const idx = db.hostelers.findIndex(h => h.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Hosteler not found.' });
  const { roomNo, bedNo, block, hostelName, roommates, messStatus } = req.body;
  db.hostelers[idx].roomNo = roomNo || db.hostelers[idx].roomNo;
  db.hostelers[idx].bedNo = bedNo || db.hostelers[idx].bedNo;
  db.hostelers[idx].block = block || db.hostelers[idx].block;
  if (hostelName) db.hostelers[idx].hostelName = hostelName;
  if (roommates !== undefined) db.hostelers[idx].roommates = Array.isArray(roommates) ? roommates : [roommates];
  if (messStatus) db.hostelers[idx].messStatus = messStatus;
  db.hostelers[idx].allotted = Boolean(db.hostelers[idx].roomNo && db.hostelers[idx].roomNo.toLowerCase() !== 'unassigned');
  db.hostelers[idx].allotmentDate = new Date().toISOString().slice(0, 10);
  writeDb(db);
  res.json({ success: true, hosteler: db.hostelers[idx] });
});

// 7-Day Mess Menu (Breakfast, Lunch, Evening Snacks, Dinner)
app.get('/api/mess-menu', requireApiKey, (req, res) => {
  const db = readDb();
  res.json(db.messMenu || DEFAULT_DB.messMenu);
});

app.put('/api/mess-menu/:day', requireApiKey, (req, res) => {
  const db = readDb();
  if (!db.messMenu) db.messMenu = JSON.parse(JSON.stringify(DEFAULT_DB.messMenu));
  const day = req.params.day;
  if (!db.messMenu[day]) return res.status(404).json({ error: 'Invalid day of week.' });
  db.messMenu[day] = { ...db.messMenu[day], ...req.body };
  writeDb(db);
  res.json({ success: true, day, menu: db.messMenu[day] });
});


// Registration Requests & Fee Receipt Verification
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

app.post('/api/registrations/:id/approve', requireApiKey, (req, res) => {
  const db = readDb();
  if (!db.registrationRequests) db.registrationRequests = [];
  const reg = db.registrationRequests.find(r => r.id === req.params.id);
  if (!reg) return res.status(404).json({ error: 'Registration request not found.' });

  const { roomNo, bedNo, block, hostelName, roommates, hodRemark } = req.body;
  reg.status = 'Approved';
  reg.allottedRoom = roomNo || 'A-101';
  reg.allottedBed = bedNo || 'Bed 1';
  reg.hodRemark = hodRemark || 'Fee receipt verified. Room allotted.';

  // Automatically create Hosteler Account
  const newHosteler = {
    id: 'STU-' + (reg.wing === 'Female' ? 'F-' : 'M-') + Math.floor(300 + Math.random() * 600),
    rollNo: reg.rollNo,
    name: reg.name,
    wing: reg.wing,
    hostelName: hostelName || reg.hostelName || (reg.wing === 'Female' ? "Gargi Girls' Hostel" : "Vivekananda Boys' Hostel"),
    block: block || 'Block A — 1st Floor',
    roomNo: reg.allottedRoom,
    bedNo: reg.allottedBed,
    roommates: roommates || [],
    allotted: true,
    allotmentDate: new Date().toISOString().slice(0, 10),
    course: reg.course || (reg.branch ? reg.branch + ' — 1st Year' : 'B.Tech — 1st Year'),
    mobile: reg.mobile,
    email: reg.email,
    parentName: reg.parentName || 'Parent / Guardian',
    parentContact: reg.parentContact || reg.mobile,
    warden: reg.wing === 'Female' ? 'Prof. Meenakshi Joshi (+91 94150 77889)' : 'Dr. S. K. Tiwari (+91 94150 11223)',
    messStatus: 'Active (Paid)',
    messCardNo: 'MPGI-MESS-2026-' + reg.allottedRoom,
    password: reg.password || '123'
  };

  db.hostelers.push(newHosteler);
  writeDb(db);
  res.json({ success: true, registration: reg, hosteler: newHosteler });
});

app.post('/api/registrations/:id/reject', requireApiKey, (req, res) => {
  const db = readDb();
  if (!db.registrationRequests) db.registrationRequests = [];
  const reg = db.registrationRequests.find(r => r.id === req.params.id);
  if (!reg) return res.status(404).json({ error: 'Registration request not found.' });
  reg.status = 'Rejected';
  reg.hodRemark = req.body.hodRemark || 'Fee receipt rejected. Please upload valid receipt.';
  writeDb(db);
  res.json({ success: true, registration: reg });
});

// Applications
app.get('/api/applications', requireApiKey, (req, res) => {
  const db = readDb();
  res.json(db.applications);
});

app.post('/api/applications', requireApiKey, (req, res) => {
  const db = readDb();
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
  const item = db.applications.find(a => a.id === req.params.id);
  if (!item) return res.status(404).json({ error: 'Application not found.' });
  if (req.body.status) item.status = req.body.status;
  if (req.body.hodRemark !== undefined) item.hodRemark = req.body.hodRemark;
  writeDb(db);
  res.json(item);
});

// Notices
app.get('/api/notices', requireApiKey, (req, res) => {
  const db = readDb();
  res.json(db.notices);
});

app.post('/api/notices', requireApiKey, (req, res) => {
  const db = readDb();
  const notice = { id: 'NOT-' + Date.now(), date: new Date().toISOString().slice(0, 10), ...req.body };
  db.notices.unshift(notice);
  writeDb(db);
  res.status(201).json(notice);
});

app.delete('/api/notices/:id', requireApiKey, (req, res) => {
  const db = readDb();
  db.notices = db.notices.filter(n => n.id !== req.params.id);
  writeDb(db);
  res.json({ deleted: true });
});

// Timetable
app.get('/api/timetable', requireApiKey, (req, res) => {
  const db = readDb();
  res.json(db.timetable);
});

app.post('/api/timetable', requireApiKey, (req, res) => {
  const db = readDb();
  const entry = { id: 'TT-' + Date.now(), ...req.body };
  db.timetable.push(entry);
  writeDb(db);
  res.status(201).json(entry);
});

app.delete('/api/timetable/:id', requireApiKey, (req, res) => {
  const db = readDb();
  db.timetable = db.timetable.filter(t => t.id !== req.params.id);
  writeDb(db);
  res.json({ deleted: true });
});

// Attendance
app.get('/api/attendance', requireApiKey, (req, res) => {
  const db = readDb();
  res.json(db.attendanceRecords);
});

app.post('/api/attendance', requireApiKey, (req, res) => {
  const db = readDb();
  const { date, records } = req.body;
  if (!date || !records) return res.status(400).json({ error: 'Missing date or records.' });
  db.attendanceRecords[date] = { ...(db.attendanceRecords[date] || {}), ...records };
  writeDb(db);
  res.json({ saved: true, date, records: db.attendanceRecords[date] });
});

app.listen(PORT, () => {
  console.log(`MPGI Hosteler's ERP server running on http://localhost:${PORT}`);
});
