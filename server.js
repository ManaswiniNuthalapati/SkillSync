const express = require("express");
const multer = require("multer");
const pdfParse = require("pdf-parse");
const cors = require("cors");
const path = require("path");

const app = express();
app.use(cors());

// Serve frontend files
app.use(express.static(path.join(__dirname, "frontend")));

// Multer setup
const upload = multer({ storage: multer.memoryStorage() });

// Skills database
const skillKeywords = [
  "python","java","sql","html","css","javascript",
  "react","node","machine learning","data analysis"
];

// Mock job list
const jobList = [
  { title:"Frontend Developer", company:"Tech Corp", location:"Hyderabad", skills:["html","css","javascript"] },
  { title:"Backend Developer", company:"Code Labs", location:"Bangalore", skills:["node","sql","python"] },
  { title:"Data Analyst", company:"Data Solutions", location:"Mumbai", skills:["python","data analysis","sql"] },
  { title:"AI Engineer", company:"AI Innovations", location:"Chennai", skills:["machine learning","python"] }
];

// Root
app.get("/", (req,res)=>{
  res.send("SkillSync Backend Running! Use /resume.html for frontend.");
});

// Analyze resume
app.post("/analyze-resume", upload.single("resume"), async (req,res)=>{
  try {
    if(!req.file) return res.status(400).json({error:"No file uploaded"});

    const data = await pdfParse(req.file.buffer);
    const text = data.text.toLowerCase();

    // Skills
    const foundSkills = skillKeywords.filter(k => text.includes(k));
    const missingSkills = skillKeywords.filter(k => !text.includes(k));

    // Score
    const score = Math.min(foundSkills.length * 10, 100);

    // Highlights
    const highlights = foundSkills.slice(0,3);

    // Jobs
    const jobs = jobList.map(job=>{
      const matched = job.skills.filter(s => foundSkills.includes(s));
      const fit = Math.round((matched.length / job.skills.length) * 100);
      return {...job, fit};
    }).filter(j=>j.fit>0).sort((a,b)=>b.fit - a.fit);

    res.json({
      score,
      highlights,
      foundSkills,
      missingSkills,
      jobs
    });

  } catch(err){
    console.error(err);
    res.status(500).json({error:"Error analyzing resume"});
  }
});

// Start server
app.listen(8000, ()=>console.log("✅ Resume Analyzer running at http://127.0.0.1:8000"));
