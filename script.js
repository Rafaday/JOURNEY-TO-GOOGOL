/* MIT License
Copyright (c) 2025 Rafaday

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

User: https://github.com/Rafaday
*/

// We use BigInt to handle extremely large numbers.
let currentCount = BigInt(0);

const countDisplay = document.getElementById('current-count');
const mainAddButtons = document.querySelectorAll('.add-button');
const openBotModalButton = document.getElementById('open-bot-modal-button');

// Bot modal elements
const botModalOverlay = document.getElementById('bot-modal-overlay');
const closeBotModalButton = document.getElementById('close-bot-modal');
const botControlButtonsContainer = document.getElementById('bot-control-buttons');

// A googol has 101 digits (1 followed by 100 zeros).
const GOOGOL_TOTAL_DIGITS = 101;

// --- Counter Logic ---

// Function to format the large number in a readable way
function formatBigInt(num) {
    let numStr = num.toString();

    if (numStr.length < GOOGOL_TOTAL_DIGITS) {
        numStr = numStr.padStart(GOOGOL_TOTAL_DIGITS, '0');
    }

    if (numStr.length <= 15) {
        return num.toLocaleString('en-US'); 
    }

    return numStr;
}

// Function to update the counter in the interface
function updateCounterDisplay() {
    countDisplay.textContent = formatBigInt(currentCount);
}

// Add event listeners to all main add buttons
mainAddButtons.forEach(button => {
    button.addEventListener('click', () => {
        const valueToAdd = BigInt(button.dataset.value);
        currentCount += valueToAdd;
        updateCounterDisplay();
    });
});

// Initialize the display on page load
updateCounterDisplay();

// Visual effect when clicking add buttons
mainAddButtons.forEach(button => {
    button.addEventListener('click', () => {
        button.classList.add('clicked');
        setTimeout(() => {
            button.classList.remove('clicked');
        }, 150);
    });
});

// --- Auto-Clicker Bot Logic (Automation Bot) ---

// To store the bot's interval ID
let botInterval = null; 
// Reference to the active bot button
let activeBotButton = null; 
// Bot click rate
const CLICKS_PER_SECOND = 50; 

/**
 * Helper function to get the display text of a main button,
 * including <sup> tags.
 * @param {HTMLElement} mainButton The main button element.
 * @returns {string} The formatted HTML (e.g., "x10<sup>18</sup>").
 */
function getMainButtonDisplayHtml(mainButton) {
    // We use innerHTML to preserve <sup> tags
    // and replace "Add " to get only the "x10..." part.
    return mainButton.innerHTML.replace('Add ', '');
}


/**
 * Starts click automation for a specific button.
 * @param {string} targetDataValue The value of the data-value attribute of the button to click.
 */
function startAutomation(targetDataValue) {
    stopAutomation(); // Ensure any previous bot is stopped

    const buttonToClick = document.querySelector(`.add-button[data-value="${targetDataValue}"]`);
    if (!buttonToClick) {
        console.error(`Error: Main button with data-value="${targetDataValue}" not found.`);
        return;
    }

    // Activate the corresponding bot button in the modal
    activeBotButton = document.querySelector(`.bot-button[data-value="${targetDataValue}"]`);
    if (activeBotButton) {
        activeBotButton.classList.add('active');
        // Get the formatted HTML of the main button to display on the bot button
        let buttonLabelHtml = getMainButtonDisplayHtml(buttonToClick);
        activeBotButton.innerHTML = `Stop Bot (${buttonLabelHtml})`;
    }

    // Time between clicks in ms
    const intervalTime = 1000 / CLICKS_PER_SECOND; 

    botInterval = setInterval(() => {
        buttonToClick.click(); // Simulates a click on the main button
    }, intervalTime);

    console.log(`Bot started for value x${targetDataValue}. Clicks per second: ${CLICKS_PER_SECOND}`);
}

/**
 * Stops any ongoing click automation.
 */
function stopAutomation() {
    if (botInterval) {
        clearInterval(botInterval);
        botInterval = null;
        console.log('Bot stopped.');
    }
    if (activeBotButton) {
        activeBotButton.classList.remove('active');
        // Get the formatted HTML of the main button to reset the bot button text
        const mainButton = document.querySelector(`.add-button[data-value="${activeBotButton.dataset.value}"]`);
        let buttonLabelHtml = mainButton ? getMainButtonDisplayHtml(mainButton) : activeBotButton.dataset.value; // Fallback
        activeBotButton.innerHTML = `Start Bot (${buttonLabelHtml})`;
        activeBotButton = null;
    }
}

/**
 * Generates the bot control buttons inside the modal.
 * Reuses values and texts from the main buttons.
 */
function generateBotControlButtons() {
    botControlButtonsContainer.innerHTML = ''; // Clear existing buttons

    mainAddButtons.forEach(mainButton => {
        const value = mainButton.dataset.value;
        const buttonDisplayHtml = getMainButtonDisplayHtml(mainButton); // Get HTML with <sup>

        const botButton = document.createElement('button');
        botButton.classList.add('bot-button');
        botButton.dataset.value = value;
        botButton.innerHTML = `Start Bot (${buttonDisplayHtml})`; // Use innerHTML here

        botButton.addEventListener('click', () => {
            if (botInterval && activeBotButton && activeBotButton.dataset.value === value) {
                // If the bot is already active for this value, stop it
                stopAutomation();
            } else {
                // If it's not active or active for another value, start it for this one
                startAutomation(value);
            }
        });
        botControlButtonsContainer.appendChild(botButton);
    });
}

// --- Lightbox/Modal Logic ---

openBotModalButton.addEventListener('click', () => {
    generateBotControlButtons(); // Generate buttons every time the modal opens
    botModalOverlay.classList.add('show');
    // Update the state of the bot buttons if any were active
    if (botInterval && activeBotButton) {
        const currentActiveBotButton = document.querySelector(`.bot-button[data-value="${activeBotButton.dataset.value}"]`);
        if (currentActiveBotButton) {
            currentActiveBotButton.classList.add('active');
            // Re-get the main button HTML for the label
            const mainButton = document.querySelector(`.add-button[data-value="${activeBotButton.dataset.value}"]`);
            let buttonLabelHtml = mainButton ? getMainButtonDisplayHtml(mainButton) : activeBotButton.dataset.value;
            currentActiveBotButton.innerHTML = `Stop Bot (${buttonLabelHtml})`;
        }
    }
});

closeBotModalButton.addEventListener('click', () => {
    botModalOverlay.classList.remove('show');
});

// Close the modal if clicking outside the content
botModalOverlay.addEventListener('click', (event) => {
    if (event.target === botModalOverlay) {
        botModalOverlay.classList.remove('show');
    }
});

// Stop the bot if the user closes the browser or navigates away
window.addEventListener('beforeunload', () => {
    stopAutomation();
});