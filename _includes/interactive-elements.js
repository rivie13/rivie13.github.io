// Add global arrays for old and new solutions
const TWO_SUM_SKELETON = [
  'from typing import List',
  '',
  'class Solution:',
  '    def twoSum(self, nums: List[int], target: int) -> List[int]:',
  '        # Write your code below'
];
let builtSolutionOld = [...TWO_SUM_SKELETON];
let builtSolutionNew = [...TWO_SUM_SKELETON];

// Add global object for per-endpoint rate limits (removed execute endpoint)
let rateLimits = {
  old: { requests: null, reset: null, timer: null },
  new: { requests: null, reset: null, timer: null }
};

// Add spinner styles
const spinnerStyles = `
<style>
.button--loading {
    position: relative;
    color: transparent !important;
    pointer-events: none;
}

.button--loading .spinner {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    width: 20px;
    height: 20px;
    border: 3px solid #ffffff;
    border-radius: 50%;
    border-top-color: transparent;
    animation: spin 1s linear infinite;
}

@keyframes spin {
    to {
        transform: translate(-50%, -50%) rotate(360deg);
    }
}
</style>
`;

// Add spinner styles to document
document.head.insertAdjacentHTML('beforeend', spinnerStyles);

// In-memory chat history for Hack Assistant
let hackChatHistory = [
  { role: 'assistant', content: "Greetings, hacker. I'm your neural infiltration assistant. How can I aid in your system breach today?" }
];

// Add a function to show rate limit info and countdown for all endpoints
function showRateLimitInfo(endpoint, requests, seconds) {
  if (!rateLimits[endpoint]) {
    rateLimits[endpoint] = { requests: null, reset: null, timer: null };
  }
  rateLimits[endpoint].requests = requests;
  rateLimits[endpoint].reset = seconds;
  const infoDiv = document.getElementById('rate-limit-info');
  if (!infoDiv) return;
  // Clear any previous timer for this endpoint
  if (rateLimits[endpoint].timer) {
    clearInterval(rateLimits[endpoint].timer);
    rateLimits[endpoint].timer = null;
  }
  // Build display for all endpoints
  let html = '';
  Object.entries(rateLimits).forEach(([key, val]) => {
    let label = key === 'old' ? 'Old AI' : key === 'new' ? 'New AI' : 'Unknown';
    if (val.requests === null || val.reset === null) return;
    if (val.requests === 0) {
      html += `${label}: Rate limit reached. Try again in <span id="rate-timer-${key}">${val.reset}</span> seconds.<br/>`;
      let remaining = val.reset;
      rateLimits[key].timer = setInterval(() => {
        remaining--;
        const timerSpan = document.getElementById(`rate-timer-${key}`);
        if (timerSpan) timerSpan.textContent = remaining;
        if (remaining <= 0) {
          clearInterval(rateLimits[key].timer);
          rateLimits[key].timer = null;
          // Optionally, reset display after timer expires
          // infoDiv.textContent = '';
        }
      }, 1000);
    } else {
      html += `${label}: Requests left: ${val.requests}.`;
      if (val.reset > 0) html += ` (refresh in ${val.reset}s)`;
      html += '<br/>';
    }
  });
  infoDiv.innerHTML = html;
}

// Add a global logging utility
function logApiCall(label, details) {
  try {
    //console.log(`[API LOG] ${label}:`, JSON.stringify(details, null, 2));
  } catch (e) {
    //console.log(`[API LOG] ${label}:`, details);
  }
}

// Update handleApiResponse to show rate limit info for a given endpoint
async function handleApiResponse(response, endpointKey) {
  logApiCall('handleApiResponse - response', {
    status: response.status,
    statusText: response.statusText,
    headers: [...response.headers.entries()],
  });
  let data;
  const text = await response.text();
  logApiCall('handleApiResponse - raw text', { text });
  try {
    data = text ? JSON.parse(text) : {};
  } catch (e) {
    logApiCall('handleApiResponse - parse error', { error: e });
    data = { error: "Invalid server response." };
  }
  if (endpointKey && data.requests_remaining !== undefined && data.reset_seconds !== undefined) {
    showRateLimitInfo(endpointKey, data.requests_remaining, data.reset_seconds);
  }
  if (!response.ok || data.error) {
    logApiCall('handleApiResponse - error', { error: data.error, status: response.status });
    throw new Error(data.error || `API request failed: ${response.status} ${response.statusText}`);
  }
  logApiCall('handleApiResponse - success', { data });
  return data;
}

// Add loading indicators for snippets
function setSnippetLoading() {
  const oldSnippetElement = document.getElementById('old-snippet');
  const newSnippetElement = document.getElementById('new-snippet');
  if (oldSnippetElement) oldSnippetElement.textContent = 'Loading...';
  if (newSnippetElement) newSnippetElement.textContent = 'Loading...';
}

const towers = {
  ForLoop: {
    name: "For Loop",
    desc: "Attacks multiple enemies in a sequence",
    cost: 50,
    dmg: 12,
    rng: 3,
    spd: 1.2,
    upgrades: ["Faster Iteration", "Enhanced Range", "+1 more"]
  },
  WhileLoop: {
    name: "While Loop",
    desc: "Continuous attack on a single path",
    cost: 75,
    dmg: 8,
    rng: 2,
    spd: 2.5,
    upgrades: ["Condition Enhancement", "Break Statement"]
  },
  IfCondition: {
    name: "If Condition",
    desc: "Attacks based on enemy type",
    cost: 40,
    dmg: 12,
    rng: 2,
    spd: 1,
    upgrades: ["Additional Branch", "ElIf Statement"]
  },
  Variable: {
    name: "Variable",
    desc: "Stores enemy information, enhances nearby towers",
    cost: 30,
    dmg: 7,
    rng: 4,
    spd: 0.8,
    upgrades: ["Type Specifialization", "Constant Declaration"]
  },
  Function: {
    name: "Function",
    desc: "Reusable attack pattern with high damage",
    cost: 100,
    dmg: 35,
    rng: 3,
    spd: 0.7,
    upgrades: ["Parameter Expansion", "Recursive Function"]
  },
  Array: {
    name: "Array",
    desc: "Fires multiple shots in array pattern",
    cost: 80,
    dmg: 10,
    rng: 4,
    spd: 1,
    upgrades: ["Sorting Attack", "Mapping Attack", "+1 more"]
  },
  Object: {
    name: "Object",
    desc: "Creates damage fields that persist",
    cost: 110,
    dmg: 25,
    rng: 3,
    spd: 0.6,
    upgrades: ["Inheritance Boost", "Polymorphic Attack", "+1 more"]
  },
  Return: {
    name: "Return",
    desc: "High damage with knockback effect",
    cost: 120,
    dmg: 30,
    rng: 2,
    spd: 0.5,
    upgrades: ["Early Return", "Multiple Returns"]
  },
  TryCatch: {
    name: "Try/Catch",
    desc: "Traps enemies and deals damage over time.",
    cost: 65,
    dmg: 10,
    rng: 3,
    spd: 0.5,
    upgrades: ["Error Handling", "Finally Block"]
  },
  Switch: {
    name: "Switch",
    desc: "Switches attack pattern based on enemies",
    cost: 60,
    dmg: 15,
    rng: 3,
    spd: 0.9,
    upgrades: ["Multiple Cases", "Default Case"]
  }
};

// Add CodeMirror configuration
const CODEMIRROR_CONFIG = {
    mode: 'python',
    theme: 'monokai',
    lineNumbers: true,
    indentUnit: 4,
    smartIndent: true,
    tabSize: 4,
    indentWithTabs: false,
    lineWrapping: false,
    matchBrackets: true,
    autoCloseBrackets: true,
    foldGutter: true,
    gutters: ['CodeMirror-linenumbers', 'CodeMirror-foldgutter'],
    extraKeys: {
        'Tab': 'indentMore',
        'Shift-Tab': 'indentLess',
        'Ctrl-Space': 'autocomplete'
    }
};

// Add CodeMirror styles
const codemirrorStyles = `
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.2/codemirror.min.css">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.2/theme/monokai.min.css">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.2/addon/fold/foldgutter.css">
<style>
.CodeMirror {
    min-height: 200px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
    font-size: 14px;
    line-height: 1.5;
    width: 100%;
}

/* Make CodeMirror editors scrollable */
.CodeMirror-scroll {
    max-height: 350px;
    overflow-y: auto;
    overflow-x: auto;
    width: 100%;
}

.solution-flex-row {
    display: flex;
    gap: 1rem;
    margin: 1rem 0;
}

.solution-flex-row > div {
    flex: 1;
    min-width: 0;
}

.CodeMirror-gutters {
    border-right: 1px solid #ddd;
    background-color: #f7f7f7;
}

html.dark .CodeMirror {
    border-color: #4a5568;
}

html.dark .CodeMirror-gutters {
    background-color: #2d3748;
    border-color: #4a5568;
}
</style>
`;

// Add styles to document
document.head.insertAdjacentHTML('beforeend', codemirrorStyles);

// Function to load scripts in sequence
function loadScript(src) {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = src;
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
    });
}

// Load CodeMirror and its addons in sequence
async function loadCodeMirror() {
    try {
        // Load main CodeMirror library first
        await loadScript('https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.2/codemirror.min.js');
        
        // Load addons after main library is loaded
        await Promise.all([
            loadScript('https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.2/mode/python/python.min.js'),
            loadScript('https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.2/addon/edit/matchbrackets.min.js'),
            loadScript('https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.2/addon/edit/closebrackets.min.js'),
            loadScript('https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.2/addon/fold/foldcode.min.js'),
            loadScript('https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.2/addon/fold/foldgutter.min.js'),
            loadScript('https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.2/addon/fold/indent-fold.min.js'),
            loadScript('https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.2/addon/hint/show-hint.min.js'),
            loadScript('https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.2/addon/hint/python-hint.min.js')
        ]);
        
        // Initialize CodeMirror after all scripts are loaded
        if (typeof CodeMirror !== 'undefined') {
            // Add any global CodeMirror configurations here if needed
            console.log('CodeMirror loaded successfully');
        }
    } catch (error) {
        console.error('Error loading CodeMirror:', error);
    }
}

// Call loadCodeMirror when the document is ready
document.addEventListener('DOMContentLoaded', loadCodeMirror);

class InteractiveElements {
    constructor() {
        this.ENDPOINTS = {
          newChat: document.getElementById('endpoints')?.dataset.newChat || '/api/fallback',
          newSnippet: document.getElementById('endpoints')?.dataset.newSnippet || '/api/fallback',
          oldChat: document.getElementById('endpoints')?.dataset.oldChat || '/api/fallback',
          oldSnippet: document.getElementById('endpoints')?.dataset.oldSnippet || '/api/fallback'
          // Removed executeTwoSum endpoint
        };

        // Optional: Re-add error handling if needed, now using this.ENDPOINTS
        Object.keys(this.ENDPOINTS).forEach(key => {
          logApiCall('Endpoint config', { key, value: this.ENDPOINTS[key] });
          if (!this.ENDPOINTS[key] || this.ENDPOINTS[key].includes('/api/fallback')) { // Check if it used fallback
            //console.warn(`Endpoint for ${key} might be using a fallback or is not configured: ${this.ENDPOINTS[key]}`);
          }
        });

        this.initializeTowerDefense();
        this.attachSolutionButtonListeners();
    }

    attachSolutionButtonListeners() {
        const clearOldBtn = document.getElementById('clear-old');
        const clearNewBtn = document.getElementById('clear-new');
        const clearBothBtn = document.getElementById('clear-both');
        const toggleBothBtn = document.getElementById('toggle-both');
        const formatCodeBtn = document.getElementById('format-code');
        
        if (clearOldBtn) clearOldBtn.onclick = () => { builtSolutionOld = [...TWO_SUM_SKELETON]; this.updateSolutionPreview(); };
        if (clearNewBtn) clearNewBtn.onclick = () => { builtSolutionNew = [...TWO_SUM_SKELETON]; this.updateSolutionPreview(); };
        if (clearBothBtn) clearBothBtn.onclick = () => { builtSolutionOld = [...TWO_SUM_SKELETON]; builtSolutionNew = [...TWO_SUM_SKELETON]; this.updateSolutionPreview(); };
        if (toggleBothBtn) toggleBothBtn.onclick = () => {
            const oldDiv = document.getElementById('old-solution-preview');
            const newDiv = document.getElementById('solution-preview');
            if (oldDiv && newDiv) {
                if (oldDiv.style.display === 'none') {
                    oldDiv.style.display = '';
                    newDiv.style.display = '';
                } else {
                    oldDiv.style.display = 'none';
                    newDiv.style.display = 'block';
                }
            }
        };
        if (formatCodeBtn) formatCodeBtn.onclick = () => {
            builtSolutionOld = this.formatCode(builtSolutionOld);
            builtSolutionNew = this.formatCode(builtSolutionNew);
            this.updateSolutionPreview();
        };
    }

    async initializeTowerDefense() {
        logApiCall('initializeTowerDefense', {});
        // Initialize tower selection
        const towerSelect = document.getElementById('tower-select');
        // REMOVE: updateTowerInfo on dropdown change
        // if (towerSelect) {
        //     towerSelect.addEventListener('change', () => this.updateTowerInfo());
        // }
        // Instead, just update tower info display (no snippet generation)
        if (towerSelect) {
            towerSelect.addEventListener('change', () => this.updateTowerInfo());
        }

        // Initialize add tower button
        const addTowerBtn = document.getElementById('add-tower');
        if (addTowerBtn) {
            addTowerBtn.addEventListener('click', () => this.addTower());
        }

        // Removed test solution button initialization since code execution is disabled

        // Initialize hack assistant
        this.initializeHackAssistant();

        // Add clear/toggle buttons for solutions
        this.addSolutionButtons();

        // Initial tower info update (show instructional message on page load)
        this.updateTowerInfo();
    }

    addSolutionButtons() {
        // Move rate limit info area next to the Add Tower button
        let infoDiv = document.getElementById('rate-limit-info');
        if (!infoDiv) {
            infoDiv = document.createElement('div');
            infoDiv.id = 'rate-limit-info';
            infoDiv.className = 'ml-4 inline-block align-middle text-sm text-gray-600';
        }
        // Insert next to the Add Tower button
        const addTowerBtn = document.getElementById('add-tower');
        if (addTowerBtn && addTowerBtn.parentNode) {
            // If not already inserted, insert after the Add Tower button
            if (addTowerBtn.nextSibling !== infoDiv) {
                addTowerBtn.parentNode.insertBefore(infoDiv, addTowerBtn.nextSibling);
            }
        }
        // Add user note above editors
        if (!document.getElementById('snippet-insert-note')) {
            const noteDiv = document.createElement('div');
            noteDiv.id = 'snippet-insert-note';
            noteDiv.className = 'mb-2 text-xs text-gray-400';
            noteDiv.innerHTML = 'Note: When you add a code snippet, it will be inserted at your current cursor position in the editor.<br>';
            noteDiv.innerHTML += '     - Even a refined prompt may not always generate the perfect code. You can always edit the code.<br>';
            noteDiv.innerHTML += '     - Only the New Code is used for reference (code execution has been disabled).<br>';
            noteDiv.innerHTML += '     - The Old Code is for comparison only.<br>';
            // Insert above the flex wrapper (editors)
            const solutionDiv = document.getElementById('solution-preview');
            if (solutionDiv && solutionDiv.parentNode) {
                solutionDiv.parentNode.parentNode.insertBefore(noteDiv, solutionDiv.parentNode);
            }
        }
        // Add clear/toggle buttons and old solution area if not present
        if (!document.getElementById('old-solution-preview')) {
            const solutionDiv = document.getElementById('solution-preview');
            if (!solutionDiv) return; // Defensive: don't proceed if missing
            const container = solutionDiv.parentNode;
            // Create flex wrapper
            const flexWrapper = document.createElement('div');
            flexWrapper.className = 'solution-flex-row';
            // Create oldDiv
            const oldDiv = document.createElement('div');
            oldDiv.id = 'old-solution-preview';
            oldDiv.className = 'bg-slate-800 text-blue-400 rounded p-4 min-h-[3rem] text-base mb-2';
            oldDiv.style.marginTop = '1rem';
            // Remove inline-block/width styles
            oldDiv.style.display = '';
            oldDiv.style.width = '';
            solutionDiv.style.display = '';
            solutionDiv.style.width = '';
            // Insert both into flex wrapper
            flexWrapper.appendChild(oldDiv);
            flexWrapper.appendChild(solutionDiv);
            // Only insert if solutionDiv is still a child of container
            if (solutionDiv.parentNode === container) {
                container.insertBefore(flexWrapper, solutionDiv);
                container.removeChild(solutionDiv);
            } else {
                // fallback: just append flexWrapper after container
                container.appendChild(flexWrapper);
            }
            // Add clear/toggle buttons
            const btnDiv = document.createElement('div');
            btnDiv.className = 'mb-2';
            btnDiv.innerHTML = `
                <button id="clear-old" class="mr-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-1 px-2 rounded">Clear Old</button>
                <button id="clear-new" class="mr-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-1 px-2 rounded">Clear New</button>
                <button id="clear-both" class="mr-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-1 px-2 rounded">Clear Both</button>
                <button id="toggle-both" class="mr-2 bg-blue-200 hover:bg-blue-300 text-blue-800 font-semibold py-1 px-2 rounded">Show/Hide Both</button>
                <button id="format-code" class="bg-green-200 hover:bg-green-300 text-green-800 font-semibold py-1 px-2 rounded">Format Code</button>
            `;
            container.parentNode.insertBefore(btnDiv, container);
        }
    }

    async updateTowerInfo() {
        logApiCall('updateTowerInfo - start', {});
        const towerType = document.getElementById('tower-select')?.value;
        const towerInfoElement = document.getElementById('tower-info');
        if (!towerType || !towers[towerType]) {
            if (towerInfoElement) {
                towerInfoElement.innerHTML = `<div class='text-gray-500'>Select a tower from the dropdown to see in-game stats and what they do.</div>`;
            }
            logApiCall('updateTowerInfo - no towerType', { towerType });
            return;
        }
        // Only update tower info display, do NOT fetch/generate snippets
        const tower = towers[towerType];
        if (towerInfoElement && tower) {
            towerInfoElement.innerHTML =
                `<div class='mb-2'><span class='font-bold'>${tower.name}</span>: ${tower.desc}</div>` +
                `<div class='mb-2'>Cost: <span class='font-semibold'>${tower.cost} BITS</span> | DMG: <span class='font-semibold'>${tower.dmg}</span> | RNG: <span class='font-semibold'>${tower.rng}</span> | SPD: <span class='font-semibold'>${tower.spd}</span></div>` +
                `<div class='mb-2'>Upgrades: <span class='text-xs'>${tower.upgrades.join(', ')}</span></div>`;
        }
        logApiCall('updateTowerInfo - end', { towerType, tower });
    }

    async addTower() {
        logApiCall('addTower - start', {});
        const towerType = document.getElementById('tower-select').value;
        const addTowerBtn = document.getElementById('add-tower');
        if (addTowerBtn) {
            // Store original button text
            const originalText = addTowerBtn.textContent;
            // Add spinner markup if not present
            if (!addTowerBtn.querySelector('.spinner')) {
                const spinner = document.createElement('span');
                spinner.className = 'spinner';
                addTowerBtn.appendChild(spinner);
            }
            addTowerBtn.classList.add('button--loading');
            addTowerBtn.disabled = true;
        }
        // Only send the code body (indented lines after the skeleton) for snippet generation
        const codeBody = builtSolutionNew.slice(TWO_SUM_SKELETON.length).join('\n');
        const context = {
            problem: {
                title: "Two Sum",
                description: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target."
            },
            language: "Python",
            // Always send the full skeleton plus code body for context
            code: [...TWO_SUM_SKELETON, ...builtSolutionNew.slice(TWO_SUM_SKELETON.length)].join('\n')
        };
        setSnippetLoading();
        try {
            logApiCall('addTower - fetch oldSnippet', { url: this.ENDPOINTS.oldSnippet, towerType, context });
            // Fetch old snippet for comparison
            const oldResponse = await fetch(this.ENDPOINTS.oldSnippet, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    towerType,
                    context
                })
            });
            logApiCall('addTower - oldSnippet response', { status: oldResponse.status });
            const oldData = await handleApiResponse(oldResponse, 'old');
            const oldSnippetElement = document.getElementById('old-snippet');
            if (oldSnippetElement) {
                oldSnippetElement.textContent = oldData.snippet || (oldData.error || 'No snippet returned.');
            }
            // Insert at cursor in old editor if present
            if (oldData.snippet && window.oldEditor && window.oldEditor.hasFocus()) {
                window.oldEditor.replaceSelection('        ' + oldData.snippet.trim() + '\n');
            } else if (oldData.snippet) {
                builtSolutionOld.push('        ' + oldData.snippet.trim());
            } else {
                builtSolutionOld.push(`# Error: ${oldData.error || 'No snippet returned.'}`);
            }
            // Fetch new snippet and add to solution
            logApiCall('addTower - fetch newSnippet', { url: this.ENDPOINTS.newSnippet, towerType, context });
            const newResponse = await fetch(this.ENDPOINTS.newSnippet, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    towerType,
                    context
                })
            });
            logApiCall('addTower - newSnippet response', { status: newResponse.status });
            const newData = await handleApiResponse(newResponse, 'new');
            const newSnippetElement = document.getElementById('new-snippet');
            if (newSnippetElement) {
                newSnippetElement.textContent = newData.snippet || (newData.error || 'No snippet returned.');
            }
            // Insert at cursor in new editor if present
            if (newData.snippet && window.newEditor && window.newEditor.hasFocus()) {
                window.newEditor.replaceSelection('        ' + newData.snippet.trim() + '\n');
            } else if (newData.snippet) {
                builtSolutionNew.push('        ' + newData.snippet.trim());
            } else {
                builtSolutionNew.push(`# Error: ${newData.error || 'No snippet returned.'}`);
            }
            this.updateSolutionPreview();
            logApiCall('addTower - end', { oldData, newData });
        } catch (error) {
            console.error('Error adding tower:', error);
            logApiCall('addTower - error', { error });
            builtSolutionNew.push(`# Error: Could not add tower. Please try again.`);
            this.updateSolutionPreview();
        } finally {
            if (addTowerBtn) {
                addTowerBtn.classList.remove('button--loading');
                addTowerBtn.disabled = false;
                // Remove spinner if it exists
                const spinner = addTowerBtn.querySelector('.spinner');
                if (spinner) {
                    spinner.remove();
                }
            }
        }
    }

    formatCode(codeLines) {
        let indentLevel = 0;
        const indentSize = 4;
        const result = [];
        
        for (let i = 0; i < codeLines.length; i++) {
            const line = codeLines[i].trim();
            
            // Skip empty lines but preserve them
            if (!line) {
                result.push('');
                continue;
            }
            
            // Handle indentation level changes
            if (line.endsWith(':')) {
                // Current line gets current indentation
                result.push(' '.repeat(indentLevel * indentSize) + line);
                // Next level gets increased indentation
                indentLevel++;
            } else if (line.startsWith('return ') || line.startsWith('break ') || line.startsWith('continue ')) {
                // These statements should be at the current indentation level
                result.push(' '.repeat(indentLevel * indentSize) + line);
            } else if (line.startsWith('class ')) {
                // Class definition resets to base level
                indentLevel = 0;
                result.push(line);
            } else if (line.startsWith('def ')) {
                // Method definition is at base level + 1
                indentLevel = 1;
                result.push(' '.repeat(indentSize) + line);
            } else if (line.startsWith('elif ') || line.startsWith('else:') || line.startsWith('except ') || line.startsWith('finally:')) {
                // These should be at the same level as their matching if/try
                indentLevel = Math.max(0, indentLevel - 1);
                result.push(' '.repeat(indentLevel * indentSize) + line);
            } else {
                // Regular code line at current indentation
                result.push(' '.repeat(indentLevel * indentSize) + line);
            }
        }
        
        return result;
    }

    validateAndFormatSolution(codeLines) {
        // First format the indentation
        let formattedLines = this.formatCode(codeLines);
        
        // Then validate and fix common structural issues
        let inForLoop = false;
        let inIfBlock = false;
        let result = [];
        
        for (let i = 0; i < formattedLines.length; i++) {
            const line = formattedLines[i].trim();
            
            // Skip empty lines
            if (!line) {
                result.push('');
                continue;
            }
            
            // Check for for loop
            if (line.startsWith('for ')) {
                inForLoop = true;
                result.push(formattedLines[i]);
                // Ensure next line is properly indented
                if (i + 1 < formattedLines.length) {
                    const nextLine = formattedLines[i + 1].trim();
                    if (nextLine && !nextLine.startsWith('    ')) {
                        formattedLines[i + 1] = '        ' + nextLine;
                    }
                }
            }
            // Check for if statement
            else if (line.startsWith('if ')) {
                inIfBlock = true;
                result.push(formattedLines[i]);
                // Ensure next line is properly indented
                if (i + 1 < formattedLines.length) {
                    const nextLine = formattedLines[i + 1].trim();
                    if (nextLine && !nextLine.startsWith('    ')) {
                        formattedLines[i + 1] = '        ' + nextLine;
                    }
                }
            }
            // Handle return statements
            else if (line.startsWith('return ')) {
                // If we're in a for loop or if block, ensure proper indentation
                if (inForLoop || inIfBlock) {
                    result.push('        ' + line);
                } else {
                    result.push(formattedLines[i]);
                }
            }
            // Handle dictionary operations
            else if (line.includes('[') && line.includes(']')) {
                // Ensure proper indentation for dictionary operations
                if (inForLoop || inIfBlock) {
                    result.push('        ' + line);
                } else {
                    result.push(formattedLines[i]);
                }
            }
            else {
                result.push(formattedLines[i]);
            }
        }
        
        return result;
    }

    updateSolutionPreview() {
        logApiCall('updateSolutionPreview', { builtSolutionOld, builtSolutionNew });
        // Format and validate both solutions
        const formattedOldSolution = this.validateAndFormatSolution(builtSolutionOld);
        const formattedNewSolution = this.validateAndFormatSolution(builtSolutionNew);

        // Update the old solution preview
        const oldDiv = document.getElementById('old-solution-preview');
        if (oldDiv) {
            // If CodeMirror already exists, just update its value
            if (window.oldEditor) {
                window.oldEditor.setValue(formattedOldSolution.join('\n'));
            } else {
                oldDiv.innerHTML = `<h4 class="font-semibold text-blue-700 dark:text-blue-600 mb-2">Old Code</h4>
                    <div id="old-editor"></div>`;
                window.oldEditor = CodeMirror(document.getElementById('old-editor'), {
                    ...CODEMIRROR_CONFIG,
                    readOnly: false
                });
                window.oldEditor.setValue(formattedOldSolution.join('\n'));
                window.oldEditor.on('change', (cm, change) => {
                    if (change.origin !== 'setValue') {
                        builtSolutionOld = cm.getValue().split('\n');
                    }
                });
            }
        }

        // Update the new solution preview
        const newDiv = document.getElementById('solution-preview');
        if (newDiv) {
            if (window.newEditor) {
                window.newEditor.setValue(formattedNewSolution.join('\n'));
            } else {
                newDiv.innerHTML = `<h4 class="font-semibold text-green-700 dark:text-green-800 mb-2">New Code</h4>
                    <div id="new-editor"></div>`;
                window.newEditor = CodeMirror(document.getElementById('new-editor'), {
                    ...CODEMIRROR_CONFIG,
                    readOnly: false
                });
                window.newEditor.setValue(formattedNewSolution.join('\n'));
                window.newEditor.on('change', (cm, change) => {
                    if (change.origin !== 'setValue') {
                        builtSolutionNew = cm.getValue().split('\n');
                    }
                });
            }
        }
    }

    initializeHackAssistant() {
        logApiCall('initializeHackAssistant', {});
        const transmitBtn = document.getElementById('transmit-btn-static');
        const hackInput = document.getElementById('hack-input-static');
        const assistLevel = document.getElementById('assist-level-static');
        const chatMsg = document.getElementById('hack-chat-msg-static');
        const chatBox = document.getElementById('hack-chat-static');

        // Add a scrollable chat log div if not present
        if (!document.getElementById('hack-chat-log')) {
            const chatLog = document.createElement('div');
            chatLog.id = 'hack-chat-log';
            chatLog.style.maxHeight = '200px';
            chatLog.style.overflowY = 'auto';
            chatLog.style.padding = '0.5rem 0';
            chatLog.className = 'text-sm';
            chatBox.innerHTML = '';
            chatBox.appendChild(chatLog);
        }
        this.renderHackChatHistory();

        if (transmitBtn && hackInput) {
            transmitBtn.onclick = async () => {
                const query = hackInput.value.trim();
                if (!query) return;
                
                // Validate and sanitize input
                if (!this.validateMessage(query)) {
                    alert('Message too long. Please keep your message under 1000 characters.');
                    return;
                }
                const sanitizedQuery = this.sanitizeInput(query);
                
                transmitBtn.classList.add('button--loading');
                // Add spinner if not present
                if (!transmitBtn.querySelector('.spinner')) {
                    const spinner = document.createElement('span');
                    spinner.className = 'spinner';
                    transmitBtn.appendChild(spinner);
                }
                hackChatHistory.push({ role: 'user', content: sanitizedQuery });
                this.renderHackChatHistory();
                logApiCall('HackAssistant - user query', { query: sanitizedQuery, assistLevel: assistLevel.value });
                try {
                    logApiCall('HackAssistant - fetch', { url: this.ENDPOINTS.newChat, query: sanitizedQuery, assistLevel: assistLevel.value });
                    // --- FIX: Map dropdown value to backend key ---
                    const assistLevelMap = {
                        "Hints Only - Get hints and guidance, but never full code.": "hints_only",
                        "Full Solution - Receive a complete code solution.": "full_solution",
                        "Step-by-Step - Get a solution broken down into logical steps.": "step_by_step",
                        "Debug Mode - Get help identifying and fixing bugs in your code.": "debug_mode",
                        "Learning Mode - Get explanations and teaching for concepts and code.": "learning_mode",
                        "Chat": "chat"
                    };
                    const selectedLevel = assistLevelMap[assistLevel.value] || "hints_only";
                    // --- END FIX ---
                    const response = await fetch(this.ENDPOINTS.newChat, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            messages: hackChatHistory.map(m => ({ role: m.role, content: m.content })),
                            assistanceLevel: selectedLevel
                        })
                    });
                    logApiCall('HackAssistant - response', { status: response.status });
                    const data = await handleApiResponse(response, 'newChat');
                    // Sanitize AI response before displaying, but don't limit length
                    const sanitizedResponse = this.sanitizeInput(data.response?.content || data.response || data.error || 'No response.');
                    hackChatHistory.push({ role: 'assistant', content: sanitizedResponse });
                    this.renderHackChatHistory();
                    hackInput.value = '';
                    logApiCall('HackAssistant - end', { data });
                } catch (error) {
                    console.error('Error getting hack assistant response:', error);
                    logApiCall('HackAssistant - error', { error });
                    hackChatHistory.push({ role: 'assistant', content: 'Error: Could not get response from Hack Assistant. Please try again.' });
                    this.renderHackChatHistory();
                } finally {
                    transmitBtn.classList.remove('button--loading');
                }
            };
        }
    }

    renderHackChatHistory() {
        const chatLog = document.getElementById('hack-chat-log');
        if (!chatLog) return;
        chatLog.innerHTML = '';
        hackChatHistory.forEach(msg => {
            const msgDiv = document.createElement('div');
            msgDiv.className = msg.role === 'user' ? 'text-right mb-2' : 'text-left mb-2';
            if (msg.role === 'user') {
                msgDiv.innerHTML = `<span class='inline-block bg-blue-200 text-blue-900 rounded px-2 py-1' style='max-width: 90%; word-break: break-word; white-space: pre-wrap; overflow-wrap: anywhere;'>${msg.content}</span>`;
            } else {
                // Use marked.js for markdown rendering
                msgDiv.innerHTML = `<span class='block bg-purple-100 text-purple-900 rounded px-2 py-1 w-full' style='width: 100%; white-space: pre-wrap; word-break: break-word; overflow-wrap: anywhere; box-sizing: border-box;'>${window.marked ? marked.parse(msg.content) : msg.content}</span>`;
            }
            chatLog.appendChild(msgDiv);
        });
        // Scroll to bottom
        chatLog.scrollTop = chatLog.scrollHeight;
    }

    // Add input validation and sanitization
    sanitizeInput(input) {
        // Remove any HTML tags
        input = input.replace(/<[^>]*>/g, '');
        // Remove any script tags
        input = input.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
        // Remove any potentially dangerous characters
        input = input.replace(/[<>]/g, '');
        return input;
    }

    validateMessage(message) {
        if (!message || typeof message !== 'string') return false;
        // Only limit length for user messages
        if (message.length > 1000) return false;
        // Check for potentially malicious content
        if (message.includes('<script') || message.includes('javascript:')) return false;
        return true;
    }
}

// Initialize when DOM is loaded
// Add rate limit info area if not present
if (!document.getElementById('rate-limit-info')) {
    const infoDiv = document.createElement('div');
    infoDiv.id = 'rate-limit-info';
    infoDiv.className = 'mb-4 text-sm text-gray-600';
    const parent = document.querySelector('.mb-4') || document.body;
    parent.parentNode.insertBefore(infoDiv, parent.nextSibling);
}
document.addEventListener('DOMContentLoaded', () => {
    if (!window.marked) {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/marked/marked.min.js';
        script.onload = () => { 
            const ie = new InteractiveElements();
            ie.attachSolutionButtonListeners();
        };
        document.body.appendChild(script);
    } else {
        const ie = new InteractiveElements();
        ie.attachSolutionButtonListeners();
    }
});