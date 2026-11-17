// ============================================================
// YOUR JOURNEY: RENDER + EVENTS
// Data and state live in journey-data.js (loaded first):
//   journeySteps, journeyPhases, rolesNote, currentStepId, expandedStepId
// ============================================================

const timelineElement = document.getElementById("timeline");
const rolesNoteElement = document.getElementById("roles-note");
const progressCountElement = document.getElementById("progress-count");
const milestoneElement = document.getElementById("milestone");
const expandAllButton = document.getElementById("expand-all");
const jumpButton = document.getElementById("jump-to-current");
const finishLineElement = document.getElementById("finish-line");

// expandedStepId is normally a step id or null. This special value means
// "every card open" (set by the Expand all button).
const ALL_OPEN = "all";

// ------------------------------------------------------------
// SMALL HELPERS: turn arrays into chip lists.
// Concept: reusing a small function instead of repeating markup.
// All text comes from journey-data.js only (hardcoded, never user input),
// so it is safe to put it straight into template strings.
// ------------------------------------------------------------
function buildChips(items, extraClass) {
  const listItems = items.map(function (item) {
    return "<li>" + item + "</li>";
  }).join("");
  return '<ul class="chips ' + (extraClass || "") + '">' + listItems + "</ul>";
}

// ------------------------------------------------------------
// ICONS (decorative emoji, hidden from screen readers)
// Presentation only, so they live here and not in journey-data.js.
// stepIcons is keyed by step id: update it if steps are added or renumbered.
// A step with no entry falls back to its phase icon.
// ------------------------------------------------------------
const phaseIcons = {
  present: "🎤",        // microphone
  credential: "🏆",     // trophy
  brand: "🎨",          // palette
  build: "🛠️",    // tools
  career: "💼",         // briefcase
  finish: "🏁"          // checkered flag
};

const stepIcons = {
  1: "📊",   // chart (slides)
  2: "🦈",   // shark
  3: "🎓",   // graduation cap
  4: "💻",   // laptop
  5: "🧠",   // brain
  6: "🤖",   // robot
  7: "🎨",   // palette
  8: "📇",   // card index
  9: "🌐",   // globe
  10: "📝",  // memo
  11: "🚀",  // rocket
  12: "🗄️", // file cabinet (database)
  13: "📄",  // page
  14: "🔗",  // link
  15: "✨",        // sparkles
  16: "🏅"   // medal
};

function getStepIcon(step) {
  return stepIcons[step.id] || phaseIcons[step.phase] || "";
}

// Brand phase decoration: a strip of color swatches (decorative placeholder)
const brandSwatchStrip =
  '<div class="swatches" aria-hidden="true">' +
    '<span style="background:#0B2545"></span><span style="background:#137C8B"></span>' +
    '<span style="background:#C9A227"></span><span style="background:#E8EDF4"></span>' +
  "</div>";

// Status is COMPUTED from progress state, never stored on the step.
function getStatus(step) {
  if (step.id < currentStepId) return "completed";
  if (step.id === currentStepId) return "current";
  return "upcoming";
}

const statusText = {
  completed: "Completed",
  current: "Current step",
  upcoming: "Upcoming"
};

// ------------------------------------------------------------
// PHASE 4: MOTION (all of it off when the user prefers reduced motion)
// Scroll-reveal: cards fade up as they enter the screen. It only runs on
// the first render, because every click re-renders the whole timeline and
// we do not want everything to fade in again each time.
// Concept: IntersectionObserver reports when an element becomes visible.
// ------------------------------------------------------------
const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
let revealOnNextRender = !reducedMotionQuery.matches && "IntersectionObserver" in window;

function startScrollReveal() {
  if (!revealOnNextRender) return;
  revealOnNextRender = false;   // later renders skip the effect

  const revealObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add("reveal--visible");
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  timelineElement.querySelectorAll(".reveal").forEach(function (element) {
    revealObserver.observe(element);
  });
}

// ------------------------------------------------------------
// PIECE 3: RENDER FUNCTION
// Builds the whole timeline from the data + the two state variables.
// Runs on page load AND after every click.
// Concept: UI = function(data, state).
// ------------------------------------------------------------
function renderJourney() {
  let html = "";
  // Scroll-reveal class: only on the very first render (see PHASE 4 motion below)
  const revealClass = revealOnNextRender ? " reveal" : "";

  journeySteps.forEach(function (step) {
    const status = getStatus(step);
    const isOpen = step.id === expandedStepId || expandedStepId === ALL_OPEN;
    const panelId = "panel-" + step.id;

    // Marker: checkmark for completed, number otherwise
    const markerSymbol = status === "completed" ? "&#10003;" : step.id;

    // Tags
    const optionalTag = step.optional ? '<span class="tag tag--optional">Optional</span>' : "";
    const hereTag = status === "current" ? '<span class="tag tag--here">You are here</span>' : "";

    // Expanded panel contents (sections only appear when they have content)
    let panelHtml = "";
    panelHtml += "<dt>What you make</dt><dd>" + step.artifact + "</dd>";
    panelHtml += "<dt>Why it matters</dt><dd>" + step.whyItMatters + "</dd>";
    panelHtml += "<dt>Skills you practice</dt><dd>" + buildChips(step.skills) + "</dd>";

    if (step.roles.length > 0) {
      panelHtml += "<dt>Roles that use this skill</dt><dd>" + buildChips(step.roles) + "</dd>";
    }

    if (step.subSteps.length > 0) {
      const subStepItems = step.subSteps.map(function (subStep) {
        return "<li><strong>" + subStep.title + "</strong>" +
               '<span class="substep-note">' + subStep.note + "</span></li>";
      }).join("");
      panelHtml += '<dt>Smaller milestones</dt><dd><ul class="substeps">' + subStepItems + "</ul></dd>";
    }

    if (step.exampleWork !== null) {
      panelHtml += '<dt>Example</dt><dd><a class="example-link" href="' + step.exampleWork + '">See an example</a></dd>';
    }

    html +=
      '<li class="step step--' + status + revealClass + '">' +
        '<span class="marker" aria-hidden="true">' + markerSymbol + "</span>" +
        '<div class="card' + (isOpen ? " card--open" : "") + '"' +
            (status === "current" ? ' aria-current="step"' : "") + ">" +
          '<button class="card-toggle" data-step-id="' + step.id + '" ' +
                  'aria-expanded="' + isOpen + '" aria-controls="' + panelId + '">' +
            '<span class="card-title">' +
              '<span class="visually-hidden">' + statusText[status] + ": </span>" +
              '<span class="step-icon" aria-hidden="true">' + getStepIcon(step) + "</span>" +
              step.title + optionalTag + hereTag +
            "</span>" +
            '<span class="chevron" aria-hidden="true"></span>' +
          "</button>" +
          '<div class="card-panel" id="' + panelId + '"' + (isOpen ? "" : " hidden") + ">" +
            "<dl>" + panelHtml + "</dl>" +
          "</div>" +
        "</div>" +
      "</li>";

    // PHASE BLOCK: after the last step of each phase
    journeyPhases.forEach(function (phase) {
      if (phase.stepIds[1] !== step.id) return;
      html += '<li class="phase-block' + revealClass + '"><span class="phase-name"><span aria-hidden="true">' +
              (phaseIcons[phase.id] || "") + "</span> " + phase.name + " phase</span>" +
              "<h2>Where this leads</h2><p>" + phase.leadsTo + "</p>";
      if (phase.roles.length > 0) {
        html += buildChips(phase.roles);
      }
      if (phase.paths.length > 0) {
        html += '<p class="phase-label">Paths</p>' + buildChips(phase.paths, "chips--paths");
      }
      if (phase.id === "brand") {
        html += brandSwatchStrip;
      }
      html += "</li>";
    });
  });

  timelineElement.innerHTML = html;
  startScrollReveal();
  rolesNoteElement.textContent = rolesNote;

  renderProgressSummary();
  expandAllButton.textContent = expandedStepId === ALL_OPEN ? "Collapse all" : "Expand all";
}

// ------------------------------------------------------------
// PROGRESS SUMMARY + MILESTONE MESSAGE
// Both are computed from currentStepId, like the step statuses.
// The milestone text is encouragement copy; edit it freely.
// ------------------------------------------------------------
function renderProgressSummary() {
  const totalSteps = journeySteps.length;
  const completedCount = journeySteps.filter(function (step) {
    return step.id < currentStepId;
  }).length;
  progressCountElement.textContent = completedCount + " of " + totalSteps + " steps done";

  // The steepest climb is the step that has sub-milestones (the Supabase step).
  const hardestStep = journeySteps.find(function (step) { return step.subSteps.length > 0; });
  const lastStepId = journeySteps[totalSteps - 1].id;
  const halfway = Math.ceil(totalSteps / 2);

  let message = "";
  if (hardestStep && currentStepId === hardestStep.id) {
    message = "This is the steepest climb of the course. Start with the first small milestone and celebrate each win.";
  } else if (currentStepId === lastStepId) {
    message = "Final step. You are about to finish what you started.";
  } else if (completedCount >= halfway) {
    message = "You are past the halfway point. Look at everything you have already built.";
  }

  milestoneElement.textContent = message;
  milestoneElement.hidden = message === "";

  // Finish line: lights up in stages as the student gets closer (CSS reads data-level).
  //   0 = under halfway, 1 = halfway, 2 = three quarters, 3 = on the final step
  let finishLevel = 0;
  if (currentStepId === lastStepId) {
    finishLevel = 3;
  } else if (completedCount / totalSteps >= 0.75) {
    finishLevel = 2;
  } else if (completedCount / totalSteps >= 0.5) {
    finishLevel = 1;
  }
  finishLineElement.dataset.level = finishLevel;
}

// ------------------------------------------------------------
// PHASE 5: CELEBRATION
// When the step picker moves forward, the step just completed gets a
// checkmark pop and a short confetti burst. Skipped for reduced motion.
// Concept: creating DOM elements in code, then removing them when done.
// ------------------------------------------------------------
const confettiColors = ["#0B2545", "#137C8B", "#C9A227", "#E8EDF4"];

function celebrateStepCompleted(completedStepId) {
  if (reducedMotionQuery.matches) return;

  // checkmark pop on the marker of the step that just became completed
  const completedStepButton = timelineElement.querySelector('.card-toggle[data-step-id="' + completedStepId + '"]');
  if (completedStepButton) {
    const completedMarker = completedStepButton.closest(".step").querySelector(".marker");
    completedMarker.classList.add("marker--pop");
  }

  // confetti: fixed-position bits that fly out from the middle of the screen
  const burst = document.createElement("div");
  burst.className = "confetti";
  burst.setAttribute("aria-hidden", "true");
  for (let pieceNumber = 0; pieceNumber < 28; pieceNumber++) {
    const piece = document.createElement("span");
    const angle = Math.random() * Math.PI * 2;
    const distance = 90 + Math.random() * 140;
    piece.style.setProperty("--dx", Math.cos(angle) * distance + "px");
    piece.style.setProperty("--dy", Math.sin(angle) * distance - 40 + "px");
    piece.style.setProperty("--spin", Math.round(Math.random() * 720 - 360) + "deg");
    piece.style.background = confettiColors[pieceNumber % confettiColors.length];
    burst.appendChild(piece);
  }
  document.body.appendChild(burst);
  setTimeout(function () { burst.remove(); }, 1400);
}

// ------------------------------------------------------------
// PHASE 5: KEYBOARD NAVIGATION
// With a card button focused, Up/Down arrows move to the previous/next
// card, and Home/End jump to the first/last. Tab and Enter still work.
// ------------------------------------------------------------
timelineElement.addEventListener("keydown", function (event) {
  if (!event.target.classList.contains("card-toggle")) return;

  const toggleButtons = Array.from(timelineElement.querySelectorAll(".card-toggle"));
  const position = toggleButtons.indexOf(event.target);
  let targetPosition = null;

  if (event.key === "ArrowDown") targetPosition = Math.min(position + 1, toggleButtons.length - 1);
  if (event.key === "ArrowUp") targetPosition = Math.max(position - 1, 0);
  if (event.key === "Home") targetPosition = 0;
  if (event.key === "End") targetPosition = toggleButtons.length - 1;

  if (targetPosition !== null) {
    event.preventDefault();   // stop the page from scrolling on its own
    toggleButtons[targetPosition].focus();
  }
});

// ------------------------------------------------------------
// PIECE 4: EVENT HANDLING (event delegation)
// One listener on the container. Re-rendering replaces the buttons,
// so listeners on the buttons themselves would be lost.
// Concept: events bubble up; closest() finds the clicked button.
// Only NAVIGATION state changes here. currentStepId never does.
// ------------------------------------------------------------
timelineElement.addEventListener("click", function (event) {
  const toggleButton = event.target.closest(".card-toggle");
  if (!toggleButton) return;

  const clickedStepId = Number(toggleButton.dataset.stepId);
  if (expandedStepId === ALL_OPEN) {
    expandedStepId = clickedStepId;   // from "all open", keep just the clicked card open
  } else {
    expandedStepId = clickedStepId === expandedStepId ? null : clickedStepId;
  }

  renderJourney();

  // The old button was replaced, so give focus back to the new one.
  const newButton = timelineElement.querySelector('.card-toggle[data-step-id="' + clickedStepId + '"]');
  if (newButton) newButton.focus();
});

// ------------------------------------------------------------
// SCROLL HELPER: bring the "you are here" card to the center.
// ------------------------------------------------------------
function scrollToCurrentStep() {
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const currentCard = timelineElement.querySelector('[aria-current="step"]');
  if (currentCard) {
    currentCard.scrollIntoView({
      block: "center",
      behavior: prefersReducedMotion ? "auto" : "smooth"
    });
  }
}

// ------------------------------------------------------------
// TOOLBAR BUTTONS: Expand/Collapse all, and Jump to "you are here"
// ------------------------------------------------------------
expandAllButton.addEventListener("click", function () {
  expandedStepId = expandedStepId === ALL_OPEN ? null : ALL_OPEN;
  renderJourney();
});

jumpButton.addEventListener("click", scrollToCurrentStep);

// ------------------------------------------------------------
// CURRENT-STEP PICKER (dropdown at the bottom of the page)
// Changes PROGRESS state without editing code, and writes the choice
// into the address bar as ?step=N so the link can be shared.
// Concepts: reading input from the URL, a form control driving state.
// ------------------------------------------------------------
const stepPicker = document.getElementById("step-picker");

// Read ?step=N. Accept only a whole number that matches a real step.
function readStepFromUrl() {
  const stepFromUrl = Number(new URLSearchParams(window.location.search).get("step"));
  const isRealStep = journeySteps.some(function (step) { return step.id === stepFromUrl; });
  return isRealStep ? stepFromUrl : null;
}

function writeStepToUrl(stepId) {
  try {
    const url = new URL(window.location.href);
    url.searchParams.set("step", stepId);
    window.history.replaceState(null, "", url);
  } catch (error) {
    // Some browsers block this on local files. The dropdown still works.
  }
}

stepPicker.innerHTML = journeySteps.map(function (step) {
  return '<option value="' + step.id + '">' + step.id + ". " + step.title + "</option>";
}).join("");

stepPicker.addEventListener("change", function () {
  const previousStepId = currentStepId;
  currentStepId = Number(stepPicker.value);
  expandedStepId = currentStepId;   // open the new "you are here" card
  writeStepToUrl(currentStepId);
  renderJourney();
  scrollToCurrentStep();

  // Moving forward means a step was just completed: celebrate it.
  if (currentStepId > previousStepId) {
    celebrateStepCompleted(currentStepId - 1);
  }
});

// ------------------------------------------------------------
// START: apply ?step=N if present, first render, scroll to "you are here".
// ------------------------------------------------------------
const stepFromUrl = readStepFromUrl();
if (stepFromUrl !== null) {
  currentStepId = stepFromUrl;
  expandedStepId = stepFromUrl;
}
stepPicker.value = currentStepId;

renderJourney();
scrollToCurrentStep();
