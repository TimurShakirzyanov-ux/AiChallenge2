// === Fake Data ===
const employees = [
  {
    id: 1, name: "Alex Johnson", title: "Senior Software Engineer", dept: "ENG.U1.D1.G1", avatar: 1,
    activities: [
      { name: "[EDU] Tech Workshop (15.03.25)", category: "Education", date: "2025-03-15", points: 64 },
      { name: "[EDU] AI Digest #5 10.04.2025", category: "Education", date: "2025-04-10", points: 64 },
      { name: "[EDU] Cloud Architecture Summit", category: "Public Speaking", date: "2025-05-22", points: 64 },
      { name: "[EDU] Knowledge Sharing Session", category: "Education", date: "2025-06-18", points: 64 },
      { name: "[EDU] DevOps Best Practices Panel", category: "Public Speaking", date: "2025-02-11", points: 64 },
      { name: "[EDU] Mentorship Program Q1", category: "Education", date: "2025-01-20", points: 64 },
      { name: "[EDU] Internal Tech Talk: Microservices", category: "Public Speaking", date: "2025-07-05", points: 64 },
      { name: "[EDU] Code Review Workshop", category: "Education", date: "2025-08-14", points: 32 },
      { name: "[EDU] Innovation Hackathon 2025", category: "Education", date: "2025-09-01", points: 16 }
    ]
  },
  {
    id: 2, name: "Sarah Chen", title: "QA Engineer", dept: "QA.U2.T1", avatar: 5,
    activities: [
      { name: "[EDU] Testing Automation Bootcamp", category: "Education", date: "2025-02-20", points: 64 },
      { name: "[EDU] QA Conference Talk", category: "Public Speaking", date: "2025-04-05", points: 64 },
      { name: "[EDU] Selenium Deep Dive Workshop", category: "Education", date: "2025-06-12", points: 64 },
      { name: "[EDU] Performance Testing Seminar", category: "Education", date: "2025-08-03", points: 64 },
      { name: "[EDU] Quality Metrics Dashboard", category: "Education", date: "2025-09-15", points: 64 },
      { name: "[EDU] Mobile Testing Strategies", category: "Public Speaking", date: "2025-05-28", points: 64 },
      { name: "[EDU] Bug Bash Organizer", category: "Education", date: "2025-07-19", points: 32 },
      { name: "[EDU] Test Strategy Workshop", category: "Education", date: "2025-03-10", points: 32 }
    ]
  },
  {
    id: 3, name: "Marcus Rodriguez", title: "Group Manager", dept: "ENG.U1.D2.G3", avatar: 8,
    activities: [
      { name: "[EDU] Leadership Forum 2025", category: "Public Speaking", date: "2025-01-15", points: 64 },
      { name: "[EDU] Agile Transformation Talk", category: "Public Speaking", date: "2025-03-22", points: 64 },
      { name: "[EDU] Team Building Workshop", category: "Education", date: "2025-05-10", points: 64 },
      { name: "[EDU] Engineering Excellence Summit", category: "Public Speaking", date: "2025-07-08", points: 64 },
      { name: "[EDU] Cross-Team Collaboration Session", category: "Education", date: "2025-09-20", points: 64 },
      { name: "[EDU] OKR Planning Workshop", category: "Education", date: "2025-06-05", points: 64 },
      { name: "[EDU] Tech Debt Reduction Strategy", category: "Education", date: "2025-04-18", points: 32 }
    ]
  },
  {
    id: 4, name: "Emily Watson", title: "Lead QA Engineer", dept: "QA.U2.T2", avatar: 9,
    activities: [
      { name: "[EDU] Cypress.io Workshop", category: "Education", date: "2025-03-05", points: 64 },
      { name: "[EDU] API Testing Masterclass", category: "Education", date: "2025-05-15", points: 64 },
      { name: "[EDU] QA Community Meetup Talk", category: "Public Speaking", date: "2025-07-22", points: 64 },
      { name: "[EDU] Shift-Left Testing Seminar", category: "Education", date: "2025-02-14", points: 64 },
      { name: "[EDU] Accessibility Testing Guide", category: "Education", date: "2025-08-28", points: 64 },
      { name: "[EDU] Contract Testing Workshop", category: "Education", date: "2025-06-19", points: 32 }
    ]
  },
  {
    id: 5, name: "David Park", title: "Software Engineer", dept: "DEV.U1.D4.NET", avatar: 11,
    activities: [
      { name: "[EDU] .NET 9 Deep Dive", category: "Education", date: "2025-01-25", points: 64 },
      { name: "[EDU] Clean Architecture Talk", category: "Public Speaking", date: "2025-04-12", points: 64 },
      { name: "[EDU] Entity Framework Workshop", category: "Education", date: "2025-06-30", points: 64 },
      { name: "[EDU] Azure DevOps Pipeline Setup", category: "Education", date: "2025-03-18", points: 64 },
      { name: "[EDU] Blazor Components Session", category: "Education", date: "2025-08-09", points: 32 }
    ]
  },
  {
    id: 6, name: "Natalie Brooks", title: "HR Manager", dept: "HR.D3.SO", avatar: 16,
    activities: [
      { name: "[EDU] Employee Engagement Workshop", category: "Education", date: "2025-02-08", points: 64 },
      { name: "[EDU] Diversity & Inclusion Talk", category: "Public Speaking", date: "2025-04-20", points: 64 },
      { name: "[EDU] Onboarding Optimization Session", category: "Education", date: "2025-06-15", points: 64 },
      { name: "[EDU] HR Tech Conference Speaker", category: "Public Speaking", date: "2025-08-22", points: 64 }
    ]
  },
  {
    id: 7, name: "Ryan Kowalski", title: "DevOps Engineer", dept: "OPS.U3.D1.K8", avatar: 12,
    activities: [
      { name: "[EDU] Kubernetes Workshop", category: "Education", date: "2025-03-12", points: 64 },
      { name: "[EDU] CI/CD Pipeline Optimization", category: "Education", date: "2025-05-18", points: 64 },
      { name: "[EDU] Infrastructure as Code Talk", category: "Public Speaking", date: "2025-07-25", points: 64 },
      { name: "[EDU] Monitoring & Observability", category: "Education", date: "2025-09-10", points: 32 }
    ]
  },
  {
    id: 8, name: "Priya Sharma", title: "Data Scientist", dept: "DS.U4.ML.G2", avatar: 20,
    activities: [
      { name: "[EDU] Machine Learning Workshop", category: "Education", date: "2025-01-30", points: 64 },
      { name: "[EDU] Data Science Conference Talk", category: "Public Speaking", date: "2025-04-08", points: 64 },
      { name: "[EDU] Python Data Pipeline Session", category: "Education", date: "2025-06-25", points: 64 },
      { name: "[EDU] NLP Research Presentation", category: "Public Speaking", date: "2025-09-05", points: 16 }
    ]
  },
  {
    id: 9, name: "James O'Brien", title: "Frontend Developer", dept: "DEV.U1.D3.FE", avatar: 14,
    activities: [
      { name: "[EDU] React 19 Features Workshop", category: "Education", date: "2025-02-15", points: 64 },
      { name: "[EDU] Web Performance Talk", category: "Public Speaking", date: "2025-05-03", points: 32 },
      { name: "[EDU] CSS Architecture Session", category: "Education", date: "2025-07-14", points: 32 },
      { name: "[EDU] Component Library Workshop", category: "Education", date: "2025-08-20", points: 64 }
    ]
  },
  {
    id: 10, name: "Linda Nguyen", title: "Product Manager", dept: "PM.U5.D2.G1", avatar: 23,
    activities: [
      { name: "[EDU] Product Strategy Workshop", category: "Education", date: "2025-03-28", points: 64 },
      { name: "[EDU] User Research Methods Talk", category: "Public Speaking", date: "2025-06-08", points: 64 },
      { name: "[EDU] Roadmap Planning Session", category: "Education", date: "2025-08-15", points: 32 }
    ]
  },
  {
    id: 11, name: "Omar Hassan", title: "Security Engineer", dept: "SEC.U6.D1.G1", avatar: 15,
    activities: [
      { name: "[EDU] OWASP Top 10 Workshop", category: "Education", date: "2025-01-18", points: 64 },
      { name: "[EDU] Threat Modeling Talk", category: "Public Speaking", date: "2025-04-25", points: 64 },
      { name: "[EDU] Penetration Testing Bootcamp", category: "Education", date: "2025-07-30", points: 32 }
    ]
  },
  {
    id: 12, name: "Hannah Kim", title: "UX Designer", dept: "UX.U7.D1.G2", avatar: 25,
    activities: [
      { name: "[EDU] Design Systems Workshop", category: "Education", date: "2025-02-22", points: 64 },
      { name: "[EDU] Accessibility Design Talk", category: "Public Speaking", date: "2025-05-30", points: 32 },
      { name: "[EDU] User Testing Methods", category: "Education", date: "2025-08-05", points: 32 },
      { name: "[EDU] Figma Advanced Workshop", category: "Education", date: "2025-09-18", points: 16 }
    ]
  },
  {
    id: 13, name: "Carlos Mendez", title: "Backend Developer", dept: "DEV.U1.D2.BE", avatar: 33,
    activities: [
      { name: "[EDU] Microservices Architecture Talk", category: "Public Speaking", date: "2025-03-08", points: 64 },
      { name: "[EDU] Database Optimization Workshop", category: "Education", date: "2025-06-20", points: 32 },
      { name: "[EDU] REST API Design Session", category: "Education", date: "2025-08-12", points: 32 }
    ]
  },
  {
    id: 14, name: "Fiona McAllister", title: "Technical Writer", dept: "DOC.U8.D1.G1", avatar: 26,
    activities: [
      { name: "[EDU] API Documentation Workshop", category: "Education", date: "2025-04-02", points: 64 },
      { name: "[EDU] Technical Writing Best Practices", category: "Public Speaking", date: "2025-07-15", points: 32 },
      { name: "[EDU] Knowledge Base Overhaul", category: "Education", date: "2025-09-08", points: 16 }
    ]
  },
  {
    id: 15, name: "Tomasz Nowak", title: "Cloud Architect", dept: "ARC.U9.D1.CL", avatar: 35,
    activities: [
      { name: "[EDU] Multi-Cloud Strategy Talk", category: "Public Speaking", date: "2025-02-28", points: 32 },
      { name: "[EDU] Serverless Architecture Workshop", category: "Education", date: "2025-05-12", points: 32 },
      { name: "[EDU] Cost Optimization Session", category: "Education", date: "2025-07-28", points: 32 }
    ]
  },
  {
    id: 16, name: "Rachel Torres", title: "Scrum Master", dept: "AGI.U10.D1.SM", avatar: 28,
    activities: [
      { name: "[EDU] Agile Ceremonies Workshop", category: "Education", date: "2025-01-22", points: 32 },
      { name: "[EDU] Sprint Retrospective Techniques", category: "Public Speaking", date: "2025-04-15", points: 32 },
      { name: "[EDU] Kanban Board Optimization", category: "Education", date: "2025-06-28", points: 16 }
    ]
  },
  {
    id: 17, name: "Daniel Fischer", title: "Mobile Developer", dept: "DEV.U1.D5.MOB", avatar: 36,
    activities: [
      { name: "[EDU] Flutter Workshop 2025", category: "Education", date: "2025-03-18", points: 32 },
      { name: "[EDU] Mobile CI/CD Pipeline Talk", category: "Public Speaking", date: "2025-06-05", points: 32 },
      { name: "[EDU] App Performance Workshop", category: "Education", date: "2025-08-25", points: 16 }
    ]
  },
  {
    id: 18, name: "Aisha Patel", title: "Machine Learning Engineer", dept: "DS.U4.ML.G3", avatar: 29,
    activities: [
      { name: "[EDU] MLOps Workshop", category: "Education", date: "2025-02-10", points: 32 },
      { name: "[EDU] AI Ethics Panel Discussion", category: "Public Speaking", date: "2025-05-20", points: 16 },
      { name: "[EDU] Model Deployment Best Practices", category: "Education", date: "2025-07-12", points: 16 },
      { name: "[UNI] University Tech Partnership Day", category: "University Partners", date: "2025-09-25", points: 8 }
    ]
  },
  {
    id: 19, name: "Viktor Sokolov", title: "Database Administrator", dept: "DBA.U11.D1.G1", avatar: 38,
    activities: [
      { name: "[EDU] PostgreSQL Tuning Workshop", category: "Education", date: "2025-04-18", points: 32 },
      { name: "[EDU] Database Migration Talk", category: "Public Speaking", date: "2025-07-05", points: 16 },
      { name: "[UNI] University Database Curriculum Review", category: "University Partners", date: "2025-09-12", points: 16 }
    ]
  },
  {
    id: 20, name: "Michelle Lee", title: "Business Analyst", dept: "BA.U12.D1.G2", avatar: 30,
    activities: [
      { name: "[EDU] Requirements Gathering Workshop", category: "Education", date: "2025-03-25", points: 16 },
      { name: "[EDU] Stakeholder Management Talk", category: "Public Speaking", date: "2025-06-10", points: 16 },
      { name: "[UNI] University Career Fair Presenter", category: "University Partners", date: "2025-08-18", points: 16 },
      { name: "[EDU] Process Mapping Session", category: "Education", date: "2025-09-28", points: 16 }
    ]
  },
  {
    id: 21, name: "Brian Walsh", title: "Systems Engineer", dept: "SYS.U13.D1.G1", avatar: 39,
    activities: [
      { name: "[EDU] Linux Administration Deep Dive", category: "Education", date: "2025-02-05", points: 16 },
      { name: "[EDU] Network Security Workshop", category: "Education", date: "2025-05-08", points: 16 },
      { name: "[EDU] Disaster Recovery Planning", category: "Education", date: "2025-08-01", points: 16 }
    ]
  },
  {
    id: 22, name: "Sofia Andersson", title: "Release Manager", dept: "REL.U14.D1.G1", avatar: 31,
    activities: [
      { name: "[EDU] Release Management Workshop", category: "Education", date: "2025-04-08", points: 16 },
      { name: "[EDU] Feature Flag Strategies", category: "Public Speaking", date: "2025-07-18", points: 16 },
      { name: "[UNI] University Software Engineering Guest Lecture", category: "University Partners", date: "2025-09-15", points: 16 }
    ]
  },
  {
    id: 23, name: "Kevin Yamamoto", title: "QA Automation Engineer", dept: "QA.U2.T3", avatar: 41,
    activities: [
      { name: "[EDU] Playwright Testing Workshop", category: "Education", date: "2025-01-28", points: 16 },
      { name: "[EDU] Test Data Management", category: "Education", date: "2025-04-22", points: 16 }
    ]
  },
  {
    id: 24, name: "Grace Liu", title: "Solutions Architect", dept: "ARC.U9.D2.SA", avatar: 32,
    activities: [
      { name: "[EDU] Enterprise Architecture Talk", category: "Public Speaking", date: "2025-03-02", points: 16 },
      { name: "[UNI] University Tech Mentorship Program", category: "University Partners", date: "2025-06-22", points: 16 }
    ]
  },
  {
    id: 25, name: "Nathan Wright", title: "Platform Engineer", dept: "PLT.U15.D1.G1", avatar: 42,
    activities: [
      { name: "[EDU] Terraform Workshop", category: "Education", date: "2025-05-25", points: 16 },
      { name: "[EDU] Platform Engineering Talk", category: "Public Speaking", date: "2025-08-08", points: 8 }
    ]
  },
  {
    id: 26, name: "Elena Volkov", title: "Project Manager", dept: "PM.U5.D3.G2", avatar: 34,
    activities: [
      { name: "[EDU] Risk Management Workshop", category: "Education", date: "2025-04-30", points: 8 },
      { name: "[UNI] University Project Management Lecture", category: "University Partners", date: "2025-07-22", points: 8 }
    ]
  },
  {
    id: 27, name: "Jason Clark", title: "Integration Developer", dept: "DEV.U1.D6.INT", avatar: 43,
    activities: [
      { name: "[EDU] API Integration Patterns Talk", category: "Public Speaking", date: "2025-03-15", points: 8 },
      { name: "[EDU] Message Queue Workshop", category: "Education", date: "2025-06-18", points: 8 }
    ]
  },
  {
    id: 28, name: "Amara Okafor", title: "Compliance Officer", dept: "COM.U16.D1.G1", avatar: 44,
    activities: [
      { name: "[EDU] GDPR Compliance Workshop", category: "Education", date: "2025-05-05", points: 8 },
      { name: "[EDU] Data Privacy Talk", category: "Public Speaking", date: "2025-08-30", points: 8 }
    ]
  },
  {
    id: 29, name: "Luke Henderson", title: "Support Engineer", dept: "SUP.U17.D1.G1", avatar: 45,
    activities: [
      { name: "[EDU] Incident Response Workshop", category: "Education", date: "2025-06-02", points: 8 },
      { name: "[UNI] University IT Support Mentoring", category: "University Partners", date: "2025-09-20", points: 8 }
    ]
  },
  {
    id: 30, name: "Yuki Tanaka", title: "Network Engineer", dept: "NET.U18.D1.G1", avatar: 46,
    activities: [
      { name: "[EDU] Zero Trust Architecture Talk", category: "Public Speaking", date: "2025-07-10", points: 8 }
    ]
  }
];

// Compute totals and category counts
employees.forEach(emp => {
  emp.totalScore = emp.activities.reduce((sum, a) => sum + a.points, 0);
  emp.catCounts = {};
  emp.activities.forEach(a => {
    emp.catCounts[a.category] = (emp.catCounts[a.category] || 0) + 1;
  });
});

// Sort descending by score
employees.sort((a, b) => b.totalScore - a.totalScore);

// Format date helper
function formatDate(dateStr) {
  const d = new Date(dateStr);
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const day = String(d.getDate()).padStart(2, '0');
  return `${day}-${months[d.getMonth()]}-${d.getFullYear()}`;
}

// Get quarter from date
function getQuarter(dateStr) {
  const month = new Date(dateStr).getMonth(); // 0-based
  if (month < 3) return "Q1";
  if (month < 6) return "Q2";
  if (month < 9) return "Q3";
  return "Q4";
}

// Category icon helpers (SVG icons matching original design)
function getCategoryIcon(category) {
  if (category === "Education") return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 3L1 9l4 2.18v6L12 21l7-3.82v-6l2-1.09V17h2V9L12 3zm6.82 6L12 12.72 5.18 9 12 5.28 18.82 9zM17 15.99l-5 2.73-5-2.73v-3.72L12 15l5-2.73v3.72z"/></svg>';
  if (category === "Public Speaking") return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z"/></svg>';
  if (category === "University Partners") return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 7V3H2v18h20V7H12zM6 19H4v-2h2v2zm0-4H4v-2h2v2zm0-4H4V9h2v2zm0-4H4V5h2v2zm4 12H8v-2h2v2zm0-4H8v-2h2v2zm0-4H8V9h2v2zm0-4H8V5h2v2zm10 12h-8v-2h2v-2h-2v-2h2v-2h-2V9h8v10zm-2-8h-2v2h2v-2zm0 4h-2v2h2v-2z"/></svg>';
  return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm4 18H6V4h7v5h5v11z"/></svg>';
}

function getCategoryBadgeClass(category) {
  if (category === "Education") return "education";
  if (category === "Public Speaking") return "public-speaking";
  if (category === "University Partners") return "university-partners";
  return "";
}

// === Render Functions ===

function getFilteredData() {
  const year = document.getElementById("filterYear").value;
  const quarter = document.getElementById("filterQuarter").value;
  const category = document.getElementById("filterCategory").value;
  const search = document.getElementById("filterSearch").value.toLowerCase().trim();

  return employees.map(emp => {
    let filtered = emp.activities.filter(a => {
      const aYear = new Date(a.date).getFullYear().toString();
      if (year && aYear !== year) return false;
      if (quarter && getQuarter(a.date) !== quarter) return false;
      if (category && a.category !== category) return false;
      return true;
    });

    if (search && !emp.name.toLowerCase().includes(search)) return null;

    if (filtered.length === 0 && !search) return null;
    if (filtered.length === 0 && search) {
      // Show person with 0 score if name matches but no activities match filters
      return { ...emp, activities: [], totalScore: 0, catCounts: {} };
    }

    const totalScore = filtered.reduce((s, a) => s + a.points, 0);
    const catCounts = {};
    filtered.forEach(a => { catCounts[a.category] = (catCounts[a.category] || 0) + 1; });

    return { ...emp, activities: filtered, totalScore, catCounts };
  }).filter(Boolean).sort((a, b) => b.totalScore - a.totalScore);
}

function renderPodium(data) {
  const container = document.getElementById("podiumSection");
  const standsContainer = document.getElementById("podiumStands");

  if (data.length < 3) {
    container.innerHTML = '<p style="text-align:center;color:#605e5c;">Not enough data for podium</p>';
    standsContainer.innerHTML = '';
    return;
  }

  const order = [data[1], data[0], data[2]]; // 2nd, 1st, 3rd
  const ranks = [2, 1, 3];

  container.innerHTML = order.map((emp, i) => {
    const rank = ranks[i];
    return `
      <div class="podium-person rank-${rank}">
        <div class="podium-avatar-wrap">
          <img class="podium-avatar" src="https://i.pravatar.cc/150?img=${emp.avatar}" alt="${emp.name}" />
          <div class="podium-rank-badge">${rank}</div>
        </div>
        <div class="podium-name">${emp.name}</div>
        <div class="podium-title">${emp.title} (${emp.dept})</div>
        <div class="podium-score-pill"><span class="star">★</span> ${emp.totalScore}</div>
      </div>`;
  }).join('');

  standsContainer.innerHTML = `
    <div class="podium-stand stand-2">2</div>
    <div class="podium-stand stand-1">1</div>
    <div class="podium-stand stand-3">3</div>`;
}

function renderList(data) {
  const container = document.getElementById("leaderboardList");

  if (data.length === 0) {
    container.innerHTML = '<div class="no-results">No results found</div>';
    return;
  }

  container.innerHTML = data.map((emp, idx) => {
    const rank = idx + 1;

    // Category icons (SVG)
    const catIcons = Object.entries(emp.catCounts).map(([cat, count]) =>
      `<span class="lb-cat-item"><span class="cat-icon">${getCategoryIcon(cat)}</span>${count}</span>`
    ).join('');

    // Activity rows
    const actRows = emp.activities.map(a =>
      `<tr>
        <td>${a.name}</td>
        <td><span class="category-badge">${a.category}</span></td>
        <td>${formatDate(a.date)}</td>
        <td class="activity-points">+${a.points}</td>
      </tr>`
    ).join('');

    const chevronSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6z"/></svg>`;

    return `
      <div class="lb-row-wrapper">
        <div class="lb-row" onclick="toggleExpand(${emp.id})">
          <div class="lb-rank">${rank}</div>
          <img class="lb-avatar" src="https://i.pravatar.cc/150?img=${emp.avatar}" alt="${emp.name}" />
          <div class="lb-info">
            <div class="lb-name">${emp.name}</div>
            <div class="lb-title">${emp.title} (${emp.dept})</div>
          </div>
          <div class="lb-categories">${catIcons}</div>
          <span class="lb-total-label">TOTAL</span>
          <div class="lb-score"><span class="star">★</span> ${emp.totalScore}</div>
          <div class="lb-chevron" id="chevron-${emp.id}">${chevronSvg}</div>
        </div>
        <div class="lb-expanded" id="expanded-${emp.id}">
          <h4>Recent Activity</h4>
          <table class="activity-table">
            <thead><tr><th>Activity</th><th>Category</th><th>Date</th><th>Points</th></tr></thead>
            <tbody>${actRows}</tbody>
          </table>
        </div>
      </div>`;
  }).join('');
}

function toggleExpand(id) {
  const el = document.getElementById(`expanded-${id}`);
  const chevron = document.getElementById(`chevron-${id}`);
  el.classList.toggle('show');
  chevron.classList.toggle('open');
}

function render() {
  const data = getFilteredData();
  renderPodium(data);
  renderList(data);
}

// === Init ===
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById("filterYear").addEventListener("change", render);
  document.getElementById("filterQuarter").addEventListener("change", render);
  document.getElementById("filterCategory").addEventListener("change", render);
  document.getElementById("filterSearch").addEventListener("input", render);
  render();
});
