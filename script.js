// ============================================================
// YOUR JOURNEY: RENDER + EVENTS
// Data and state live in journey-data.js (loaded first):
//   journeySteps, journeyPhases, rolesNote, currentStepId, expandedStepId
// ============================================================

const timelineElement = document.getElementById("timeline");
const rolesNoteElement = document.getElementById("roles-note");

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
// PIECE 3: RENDER FUNCTION
// Builds the whole timeline from the data + the two state variables.
// Runs on page load AND after every click.
// Concept: UI = function(data, state).
// ------------------------------------------------------------
function renderJourney() {
  let html = "";

  journeySteps.forEach(function (step) {
    const status = getStatus(step);
    const isOpen = step.id === expandedStepId;
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
      '<li class="step step--' + status + '">' +
        '<span class="marker" aria-hidden="true">' + markerSymbol + "</span>" +
        '<div class="card' + (isOpen ? " card--open" : "") + '"' +
            (status === "current" ? ' aria-current="step"' : "") + ">" +
          '<button class="card-toggle" data-step-id="' + step.id + '" ' +
                  'aria-expanded="' + isOpen + '" aria-controls="' + panelId + '">' +
            '<span class="card-title">' +
              '<span class="visually-hidden">' + statusText[status] + ": </span>" +
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
      html += '<li class="phase-block"><h2>Where this leads</h2><p>' + phase.leadsTo + "</p>";
      if (phase.roles.length > 0) {
        html += buildChips(phase.roles);
      }
      if (phase.paths.length > 0) {
        html += '<p class="phase-label">Paths</p>' + buildChips(phase.paths, "chips--paths");
      }
      html += "</li>";
    });
  });

  timelineElement.innerHTML = html;
  rolesNoteElement.textContent = rolesNote;
}

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
  expandedStepId = clickedStepId === expandedStepId ? null : clickedStepId;

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
  currentStepId = Number(stepPicker.value);
  expandedStepId = currentStepId;   // open the new "you are here" card
  writeStepToUrl(currentStepId);
  renderJourney();
  scrollToCurrentStep();
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
