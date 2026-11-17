// ============================================================
// STUDENT JOURNEY ROADMAP — DATA LAYER (v2: adds roles + phases)
// 14 steps from first presentation to capstone.
// Mirrors the Shark Tank Showcase pattern: one array of objects,
// state variables, one render function.
// ============================================================

// STATE
// currentStepId  = PROGRESS state. Instructor sets it per cohort. Never changes on click.
// expandedStepId = NAVIGATION state. Which card is open. Starts on the current step
//                  so the page opens on "you are here". null means all cards closed.
let currentStepId = 9;
let expandedStepId = currentStepId;

// DATA: STEPS
// Field guide:
//   id           number   position in the journey (1-14)
//   title        string   short card heading
//   phase        string   must match a phase id in journeyPhases below
//   optional     boolean  true = optional track (no one is "behind" for skipping it)
//   artifact     string   the tangible thing the student ends up with
//   whyItMatters string   one line, student-facing, plain language
//   skills       array    skills practiced at this step
//   roles        array    OPTIONAL. Roles that use this skill. Only on cards where the
//                         link is honest. Empty array = render nothing (no empty label).
//   subSteps     array    smaller milestones inside a big step (empty if none)
//   exampleWork  string|null  path/link to opted-in past work. null until a student
//                             has given explicit consent. Never add without consent.
const journeySteps = [
  {
    id: 1,
    title: "Google Slides Presentation",
    phase: "present",
    optional: false,
    artifact: "A short slide deck introducing yourself and your goals",
    whyItMatters: "Your first finished piece of work, and proof you can show up and share it.",
    skills: ["Presenting", "Organizing ideas", "Slide design basics"],
    roles: [],
    subSteps: [],
    exampleWork: null
  },
  {
    id: 2,
    title: "Shark Tank Hustle Pitch",
    phase: "present",
    optional: false,
    artifact: "A pitch of your side hustle idea to the class",
    whyItMatters: "This idea becomes the thread that runs through your website and capstone.",
    skills: ["Pitching", "Problem and customer thinking", "Public speaking"],
    roles: ["Entrepreneur"],
    subSteps: [],
    exampleWork: null
  },
  {
    id: 3,
    title: "Claude in Action Certification",
    phase: "credential",
    optional: true,
    artifact: "An Anthropic course completion certificate",
    whyItMatters: "A credential you can list on your resume and LinkedIn.",
    skills: ["Working with AI assistants", "Prompting"],
    roles: [],
    subSteps: [],
    exampleWork: null
  },
  {
    id: 4,
    title: "Claude Code Certification",
    phase: "credential",
    optional: true,
    artifact: "An Anthropic course completion certificate",
    whyItMatters: "Shows you can use AI as a coding partner, not just a search box.",
    skills: ["AI-assisted coding", "Reading generated code"],
    roles: [],
    subSteps: [],
    exampleWork: null
  },
  {
    id: 5,
    title: "AI Fluency Certification",
    phase: "credential",
    optional: true,
    artifact: "An Anthropic course completion certificate",
    whyItMatters: "Builds the judgment for when to trust AI output and when to check it.",
    skills: ["AI literacy", "Critical evaluation"],
    roles: [],
    subSteps: [],
    exampleWork: null
  },
  {
    id: 6,
    title: "Digital Business Card",
    phase: "build",
    optional: false,
    artifact: "Your first digital product, live on the web",
    whyItMatters: "Something real with your name on it that anyone can open from a link.",
    skills: ["HTML", "CSS", "Publishing a site"],
    roles: [],
    subSteps: [],
    exampleWork: null
  },
  {
    id: 7,
    title: "Single-Page Hustle Website",
    phase: "build",
    optional: false,
    artifact: "A one-page website for your side hustle idea",
    whyItMatters: "Your pitch from step 2 becomes something customers could actually visit.",
    skills: ["Page layout", "Responsive CSS", "Writing for the web"],
    roles: ["Content Creator", "Freelance Site Builder"],
    subSteps: [],
    exampleWork: null
  },
  {
    id: 8,
    title: "Multi-Page Website with a Form",
    phase: "build",
    optional: false,
    artifact: "Your site expanded with About and Contact pages, including a form with validation",
    whyItMatters: "Real sites have more than one page, and real forms check what people type.",
    skills: ["Multi-page navigation", "Form handling", "Input validation", "JavaScript events"],
    roles: ["Digital Marketing Assistant", "QA Tester (entry-level)"],
    subSteps: [],
    exampleWork: null
  },
  {
    id: 9,
    title: "AI Hackathon Project",
    phase: "build",
    optional: true,
    artifact: "A project built in a time-boxed hackathon",
    whyItMatters: "Practice building fast under a deadline, and showing the result.",
    skills: ["Rapid prototyping", "Collaboration", "Demoing your work"],
    roles: ["Project Assistant / Coordinator"],
    subSteps: [],
    exampleWork: null
  },
  {
    id: 10,
    title: "Site Features Powered by Supabase",
    phase: "build",
    optional: false,
    artifact: "Your website with 2-3 features that read and write data in Supabase",
    whyItMatters: "This is the step that turns a static site into a real app, and it is the hardest part of the course.",
    skills: ["Databases", "Reading and writing data", "Async JavaScript", "Debugging"],
    roles: ["Junior Web Developer", "QA Tester (entry-level)"],
    // Smaller milestones so students get frequent wins during the steepest climb.
    subSteps: [
      {
        id: "10a",
        title: "Connect to Supabase and read one row",
        note: "Suggested warm-up so the first win comes quickly."
      },
      {
        id: "10b",
        title: "Data-focused feature",
        note: "Display data from Supabase on your site."
      },
      {
        id: "10c",
        title: "Interactive feature",
        note: "Let visitors do something that changes the data."
      }
    ],
    exampleWork: null
  },
  {
    id: 11,
    title: "Resume",
    phase: "career",
    optional: false,
    artifact: "A finished resume that includes your projects and certifications",
    whyItMatters: "The document employers actually ask for, now with real projects to list.",
    skills: ["Resume writing", "Describing your work"],
    roles: [],
    subSteps: [],
    exampleWork: null
  },
  {
    id: 12,
    title: "LinkedIn Profile",
    phase: "career",
    optional: false,
    artifact: "A complete LinkedIn profile",
    whyItMatters: "Where recruiters and hiring managers will look you up.",
    skills: ["Professional branding", "Networking basics"],
    roles: [],
    subSteps: [],
    exampleWork: null
  },
  {
    id: 13,
    title: "Capstone: Polish Your Website",
    phase: "finish",
    optional: false,
    artifact: "Your expanded site, polished and ready to show",
    whyItMatters: "Your best work in one place, the thing you point to in interviews.",
    skills: ["Refining", "Testing", "Presenting your work"],
    roles: ["Junior Web Developer", "Project Assistant / Coordinator"],
    subSteps: [],
    exampleWork: null
  },
  {
    id: 14,
    title: "Google AI Essentials Certification",
    phase: "finish",
    optional: false,
    artifact: "A Google certificate",
    whyItMatters: "A recognized credential to close out the course.",
    skills: ["AI fundamentals"],
    roles: [],
    subSteps: [],
    exampleWork: null
  }
];

// DATA: PHASES
// One entry per phase. Renders as a small "Where this leads" block under the
// last step of each phase (not on every card).
//   id         string   matches `phase` on journeySteps
//   name       string   display name
//   stepIds    array    [first, last] step ids in this phase
//   roles      array    entry-level roles this phase builds toward
//   paths      array    self-employment paths (shown with a separate "Paths" label)
//   leadsTo    string   one or two plain sentences, student-facing
const journeyPhases = [
  {
    id: "present",
    name: "Present",
    stepIds: [1, 2],
    roles: ["Communication Assistant"],
    paths: ["Entrepreneur"],
    leadsTo: "Presenting clearly is the base of communication roles, and your pitch is the first step on an entrepreneur path."
  },
  {
    id: "credential",
    name: "Credential",
    stepIds: [3, 5],
    roles: ["Small Business Tech Consultant"],
    paths: [],
    leadsTo: "AI credentials give you something to point to when you help small businesses get started with AI tools."
  },
  {
    id: "build",
    name: "Build",
    stepIds: [6, 10],
    roles: ["Digital Marketing Assistant", "Content Creator", "Freelance Site Builder", "QA Tester (entry-level)"],
    paths: [],
    leadsTo: "Your sites and features are the proof for roles that create, run, and test websites."
  },
  {
    id: "career",
    name: "Career",
    stepIds: [11, 12],
    roles: [],
    paths: ["Freelancer"],
    leadsTo: "Your resume and LinkedIn profile are how employers or freelance clients find you and see what you can do."
  },
  {
    id: "finish",
    name: "Finish",
    stepIds: [13, 14],
    roles: ["Junior Web Developer", "Project Assistant / Coordinator", "Administrative Professional"],
    paths: [],
    leadsTo: "A finished capstone and a closing credential show you can plan, build, and deliver a project from start to finish."
  }
];

// One-line honesty note, rendered once near the first "Where this leads" block
// (or in the page footer). Do not remove it or reword it into a promise.
const rolesNote = "These are starting points, not guarantees. Entry-level roles and requirements vary by employer.";

// ------------------------------------------------------------
// HOW THE RENDER FUNCTION WILL USE THIS (for the build step)
//   step.id <  currentStepId  -> "completed" style
//   step.id === currentStepId -> "you are here" style
//   step.id >  currentStepId  -> "coming up" style
//   step.optional             -> show an "Optional" tag
//   step.roles.length > 0     -> inside the expanded card, show "Roles that use this skill"
//                                (omit the label entirely when the array is empty)
//   step.subSteps.length > 0  -> show sub-milestones under the card
//   step.exampleWork !== null -> show a "See an example" link
//   phase block               -> after the last step of each phase, show journeyPhases[i]:
//                                "Where this leads", leadsTo text, roles, and "Paths" if any
// ------------------------------------------------------------
