<script>
// Get endpoints from data attributes
const ENDPOINTS = {
  newChat: document.getElementById('endpoints')?.dataset.newChat || '/api/fallback',
  newSnippet: document.getElementById('endpoints')?.dataset.newSnippet || '/api/fallback',
  oldChat: document.getElementById('endpoints')?.dataset.oldChat || '/api/fallback',
  oldSnippet: document.getElementById('endpoints')?.dataset.oldSnippet || '/api/fallback',
  executeTwoSum: document.getElementById('endpoints')?.dataset.executeTwoSum || '/api/fallback'
};

// Add error handling for missing endpoints
Object.keys(ENDPOINTS).forEach(key => {
  if (!ENDPOINTS[key]) {
    console.error(`Missing or invalid endpoint for ${key}`);
    ENDPOINTS[key] = '/api/fallback'; // Fallback endpoint
  }
});

// Helper function to handle API responses
async function handleApiResponse(response) {
  if (!response.ok) {
    const errorText = await response.text();
    console.error('API Error:', {
      status: response.status,
      statusText: response.statusText,
      body: errorText
    });
    throw new Error(`API request failed: ${response.status} ${response.statusText}`);
  }
  return response.json();
}

class InteractiveElements {
    constructor() {
        this.initializeTowerDefense();
    }

    async initializeTowerDefense() {
        // Initialize tower selection
        const towerSelect = document.getElementById('tower-select');
        if (towerSelect) {
            towerSelect.addEventListener('change', () => this.updateTowerInfo());
        }

        // Initialize add tower button
        const addTowerBtn = document.getElementById('add-tower');
        if (addTowerBtn) {
            addTowerBtn.addEventListener('click', () => this.addTower());
        }

        // Initialize test solution button
        const testSolutionBtn = document.getElementById('test-solution');
        if (testSolutionBtn) {
            testSolutionBtn.addEventListener('click', () => this.testSolution());
        }

        // Initialize hack assistant
        this.initializeHackAssistant();

        // Initial tower info update
        this.updateTowerInfo();
    }

    async updateTowerInfo() {
        const towerType = document.getElementById('tower-select')?.value;
        if (!towerType) {
            console.error('Tower select element not found');
            return;
        }

        const context = {
            problem: {
                title: "Two Sum",
                description: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target."
            },
            language: "Python",
            code: document.getElementById('solution-preview')?.textContent || ''
        };

        try {
            // Get old method snippet
            const oldResponse = await fetch(ENDPOINTS.oldSnippet, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    towerType,
                    context
                })
            });
            const oldData = await handleApiResponse(oldResponse);
            const oldSnippetElement = document.getElementById('old-snippet');
            if (oldSnippetElement) {
                oldSnippetElement.textContent = oldData.snippet;
            }

            // Get new method snippet
            const newResponse = await fetch(ENDPOINTS.newSnippet, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    towerType,
                    context
                })
            });
            const newData = await handleApiResponse(newResponse);
            const newSnippetElement = document.getElementById('new-snippet');
            if (newSnippetElement) {
                newSnippetElement.textContent = newData.snippet;
            }

            // Update tower info display
            const tower = towers[towerType];
            const towerInfoElement = document.getElementById('tower-info');
            if (towerInfoElement && tower) {
                towerInfoElement.innerHTML =
                    `<div class='mb-2'><span class='font-bold'>${tower.name}</span>: ${tower.desc}</div>` +
                    `<div class='mb-2'>Cost: <span class='font-semibold'>${tower.cost} BITS</span> | DMG: <span class='font-semibold'>${tower.dmg}</span> | RNG: <span class='font-semibold'>${tower.rng}</span> | SPD: <span class='font-semibold'>${tower.spd}</span></div>` +
                    `<div class='mb-2'>Upgrades: <span class='text-xs'>${tower.upgrades.join(', ')}</span></div>`;
            }
        } catch (error) {
            console.error('Error updating tower info:', error);
            // Show error to user
            const towerInfoElement = document.getElementById('tower-info');
            if (towerInfoElement) {
                towerInfoElement.innerHTML = `<div class='text-red-500'>Error: Could not load tower information. Please try again later.</div>`;
            }
        }
    }

    async addTower() {
        const towerType = document.getElementById('tower-select').value;
        const context = {
            problem: {
                title: "Two Sum",
                description: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target."
            },
            language: "Python",
            code: document.getElementById('solution-preview').textContent
        };

        try {
            const response = await fetch(ENDPOINTS.newSnippet, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    towerType,
                    context
                })
            });
            const data = await response.json();
            builtSolution.push(data.snippet);
            this.updateSolutionPreview();
        } catch (error) {
            console.error('Error adding tower:', error);
        }
    }

    updateSolutionPreview() {
        document.getElementById('solution-preview').textContent = builtSolution.join('\n');
    }

    async testSolution() {
        const solution = document.getElementById('solution-preview').textContent;
        try {
            const response = await fetch(ENDPOINTS.executeTwoSum, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code: solution })
            });
            const data = await response.json();
            const resultDiv = document.getElementById('test-result');
            if (data.all_passed) {
                resultDiv.innerHTML = '<span style="color:#22c55e;">✅ Success! Your solution passed all test cases.</span>';
            } else {
                resultDiv.innerHTML = '<span style="color:#f87171;">❌ Oops! Your solution is incomplete or has a bug. Try using more towers or ask the Hack Assistant for help.</span>';
            }
        } catch (error) {
            console.error('Error testing solution:', error);
        }
    }

    initializeHackAssistant() {
        const transmitBtn = document.getElementById('transmit-btn-static');
        const hackInput = document.getElementById('hack-input-static');
        const assistLevel = document.getElementById('assist-level-static');
        const chatMsg = document.getElementById('hack-chat-msg-static');

        if (transmitBtn && hackInput) {
            transmitBtn.addEventListener('click', async () => {
                const query = hackInput.value.trim();
                if (!query) return;

                try {
                    const response = await fetch(ENDPOINTS.newChat, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            messages: [{ role: 'user', content: query }],
                            assistanceLevel: assistLevel.value.toLowerCase().replace(/[^a-z_]/g, '_')
                        })
                    });
                    const data = await response.json();
                    chatMsg.textContent = data.response?.content || data.response || 'No response.';
                    hackInput.value = '';
                } catch (error) {
                    console.error('Error getting hack assistant response:', error);
                    chatMsg.textContent = 'Error: Could not get response from Hack Assistant. Please try again.';
                }
            });
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new InteractiveElements();
});
</script>