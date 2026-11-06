// Seeds one organizer, one student and the sample events from the screenshots.
// Usage: npm run seed   (clears users, events and registrations first)
import "dotenv/config";
import mongoose from "mongoose";
import connectDB from "../config/db.js";
import User from "../models/User.js";
import Event from "../models/Event.js";
import Registration from "../models/Registration.js";

// Event pictures live in client/public/images (served by the React app)
const img = (key) => `/images/${key}.jpg`;
// Date n days from today (midnight), so sample events are always in the future
const inDays = (n) => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  d.setHours(0, 0, 0, 0);
  return d;
};

await connectDB();
await Promise.all([
  User.deleteMany({}),
  Event.deleteMany({}),
  Registration.deleteMany({}),
]);

const organizer = await User.create({
  name: "Cultural Committee",
  email: "organizer@college.edu.in",
  password: "Organizer@123",
  role: "organizer",
});
await User.create({
  name: "Demo Student",
  email: "student@college.edu.in",
  password: "Student@123",
  rollNumber: "25MCA001",
  department: "MCA",
  academicYear: "1st Year",
  phone: "9876543210",
});

const base = (o) => ({
  eventType: "Offline",
  maxParticipants: 100,
  createdBy: organizer._id,
  ...o,
});
const info = (organizerName, department, contactEmail, contactPhone) => ({
  organizerName,
  department,
  contactEmail,
  contactPhone,
});
await Event.insertMany([
  base({
    eventName: "Cultural Fest 2025",
    category: "Cultural",
    date: inDays(15),
    registrationDeadline: inDays(10),
    time: "09:00 AM - 05:00 PM",
    venue: "Auditorium",
    maxParticipants: 200,
    image: img("cultural"),
    description:
      "The Cultural Fest is the annual cultural celebration of our college, bringing together students from different departments to showcase their creativity, talent and passion. The event includes a variety of competitions such as singing, dancing, drama, fashion show, and more.\n\nIt is a great opportunity to network, make new friends and be a part of the vibrant college community.",
    tagline: "Be Creative | Be Confident | Be a Part of Something Big!",
    highlights: [
      "Solo and group performances (singing, dance, drama, etc.)",
      "Attractive prizes for winners and runners-up",
      "Open for all college students",
      "Food stalls and entertainment activities",
    ],
    gallery: [img("music"), img("food")],
    ...info(
      "Cultural Committee",
      "Student Affairs",
      "cultural@college.edu.in",
      "+91 98765 43210",
    ),
  }),
  base({
    eventName: "Sports Meet 2025",
    category: "Sports",
    date: inDays(18),
    registrationDeadline: inDays(12),
    time: "08:00 AM - 04:00 PM",
    venue: "Sports Complex",
    maxParticipants: 150,
    image: img("sports"),
    description: "Join the inter-college sports meet and show your game!",
    highlights: ["Track and field events", "Team tournaments"],
    ...info(
      "Sports Committee",
      "Physical Education",
      "sports@college.edu.in",
      "+91 98765 43211",
    ),
  }),
  base({
    eventName: "Web Development Workshop",
    category: "Workshop",
    date: inDays(22),
    registrationDeadline: inDays(18),
    time: "10:00 AM - 01:00 PM",
    venue: "Computer Lab 1",
    maxParticipants: 50,
    image: img("webdev"),
    description: "Learn modern web technologies and build real-world projects.",
    highlights: ["Hands-on React and Tailwind", "Mini project"],
    ...info(
      "Coding Club",
      "Computer Applications",
      "codingclub@college.edu.in",
      "+91 98765 43212",
    ),
  }),
  base({
    eventName: "Music Fest",
    category: "Cultural",
    date: inDays(25),
    registrationDeadline: inDays(20),
    time: "05:00 PM - 10:00 PM",
    venue: "Auditorium",
    image: img("music"),
    description: "Live performances, bands and much more. Feel the rhythm!",
    highlights: ["Live bands", "Open mic"],
    ...info(
      "Music Club",
      "Student Affairs",
      "music@college.edu.in",
      "+91 98765 43213",
    ),
  }),
  base({
    eventName: "Design Thinking Workshop",
    category: "Workshop",
    date: inDays(28),
    registrationDeadline: inDays(24),
    time: "10:00 AM - 01:00 PM",
    venue: "Seminar Hall",
    maxParticipants: 60,
    image: img("design"),
    description:
      "Explore creativity and problem solving through design thinking.",
    highlights: ["Ideation", "Prototyping"],
    ...info(
      "Innovation Cell",
      "Management",
      "innovation@college.edu.in",
      "+91 98765 43214",
    ),
  }),
  base({
    eventName: "Coding Competition",
    category: "Technical",
    date: inDays(35),
    registrationDeadline: inDays(30),
    time: "09:00 AM - 01:00 PM",
    venue: "Computer Lab 2",
    image: img("coding"),
    description: "Test your coding skills and win exciting prizes!",
    highlights: ["Algorithm round", "Final round"],
    ...info(
      "Coding Club",
      "Computer Applications",
      "codingclub@college.edu.in",
      "+91 98765 43212",
    ),
  }),
  base({
    eventName: "Food Fest",
    category: "Others",
    date: inDays(40),
    registrationDeadline: inDays(35),
    time: "10:00 AM - 04:00 PM",
    venue: "College Ground",
    maxParticipants: 80,
    image: img("food"),
    description: "Taste a variety of cuisines from different regions.",
    highlights: ["Regional cuisines", "Cooking demos"],
    ...info(
      "Cultural Committee",
      "Student Affairs",
      "cultural@college.edu.in",
      "+91 98765 43210",
    ),
  }),
  base({
    eventName: "Photography Contest",
    category: "Technical",
    date: inDays(45),
    registrationDeadline: inDays(40),
    time: "11:00 AM - 04:00 PM",
    venue: "Seminar Hall",
    maxParticipants: 70,
    image: img("photography"),
    description: "Capture the moments, tell the stories.",
    highlights: ["Theme-based entries", "Photo walk"],
    ...info(
      "Media Club",
      "Mass Communication",
      "media@college.edu.in",
      "+91 98765 43215",
    ),
  }),
]);

console.log("Seed complete");
console.log("Organizer: organizer@college.edu.in / Organizer@123");
console.log("Student:   student@college.edu.in / Student@123");
await mongoose.disconnect();
