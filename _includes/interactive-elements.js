
<script>
const ENDPOINTS = {
  newChat: "{{ site.data.config.endpoints.newChat }}",
  newSnippet: "{{ site.data.config.endpoints.newSnippet }}",
  oldChat: "{{ site.data.config.endpoints.oldChat }}",
  oldSnippet: "{{ site.data.config.endpoints.oldSnippet }}",
  executeTwoSum: "{{ site.data.config.endpoints.executeTwoSum }}"
};

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

        // Initialize hack assistant (now uses newChat endpoint)
        this.initializeHackAssistant();

        // Initial tower info update
        this.updateTowerInfo();
    }

    async updateTowerInfo() {
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
            // Get old method snippet
            const oldResponse = await fetch(ENDPOINTS.oldSnippet, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    towerType,
                    context
                })
            });
            const oldData = await oldResponse.json();
            document.getElementById('old-snippet').textContent = oldData.snippet;

            // Get new method snippet
            const newResponse = await fetch(ENDPOINTS.newSnippet, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    towerType,
                    context
                })
            });
            const newData = await newResponse.json();
            document.getElementById('new-snippet').textContent = newData.snippet;

            // Update tower info display
            const tower = towers[towerType];
            document.getElementById('tower-info').innerHTML =
                `<div class='mb-2'><span class='font-bold'>${tower.name}</span>: ${tower.desc}</div>` +
                `<div class='mb-2'>Cost: <span class='font-semibold'>${tower.cost} BITS</span> | DMG: <span class='font-semibold'>${tower.dmg}</span> | RNG: <span class='font-semibold'>${tower.rng}</span> | SPD: <span class='font-semibold'>${tower.spd}</span></div>` +
                `<div class='mb-2'>Upgrades: <span class='text-xs'>${tower.upgrades.join(', ')}</span></div>`;
        } catch (error) {
            console.error('Error updating tower info:', error);
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