// Life Dashboard App - Main JavaScript File
// Handles all dashboard functionality including habits, mood tracking, water intake, and data persistence

class LifeDashboard {
    constructor() {
        // Initialize app state
        this.habits = ['exercise', 'reading', 'meditation', 'healthy-meal', 'sleep-early', 'no-social-media'];
        this.data = this.loadData();
        this.init();
    }

    // Initialize the dashboard
    init() {
        this.updateDate();
        this.setupEventListeners();
        this.loadFromLocalStorage();
        this.updateUI();
        this.checkForNewDay();
    }

    // Update current date display
    updateDate() {
        const now = new Date();
        const options = { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        };
        
        document.getElementById('currentDate').textContent = now.toLocaleDateString('en-US', options);
        document.getElementById('dayOfWeek').textContent = `${now.toLocaleDateString('en-US', { weekday: 'long' })}`;
    }

    // Set up all event listeners
    setupEventListeners() {
        // Dark mode toggle
        document.getElementById('darkModeToggle').addEventListener('click', () => this.toggleDarkMode());
        
        // Reset button
        document.getElementById('resetBtn').addEventListener('click', () => this.resetDay());
        
        // Habit checkboxes
        this.habits.forEach(habit => {
            const checkbox = document.getElementById(habit);
            if (checkbox) {
                checkbox.addEventListener('change', (e) => this.updateHabit(habit, e.target.checked));
            }
        });

        // Mood selector buttons
        document.querySelectorAll('.mood-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.updateMood(e.target.dataset.mood));
        });

        // Water intake buttons
        document.getElementById('addWater').addEventListener('click', () => this.updateWater(1));
        document.getElementById('removeWater').addEventListener('click', () => this.updateWater(-1));
    }

    // Load data from localStorage or create default structure
    loadData() {
        const saved = localStorage.getItem('lifeDashboardData');
        if (saved) {
            return JSON.parse(saved);
        }
        
        // Default data structure
        return {
            date: this.getTodayString(),
            habits: {},
            mood: null,
            water: 0,
            darkMode: false
        };
    }

    // Save current data to localStorage
    saveData() {
        localStorage.setItem('lifeDashboardData', JSON.stringify(this.data));
    }

    // Get today's date as string (YYYY-MM-DD format)
    getTodayString() {
        return new Date().toISOString().split('T')[0];
    }

    // Check if it's a new day and reset if necessary
    checkForNewDay() {
        const today = this.getTodayString();
        if (this.data.date !== today) {
            // New day detected - reset daily data
            this.data = {
                date: today,
                habits: {},
                mood: null,
                water: 0,
                darkMode: this.data.darkMode // Preserve dark mode preference
            };
            this.saveData();
            this.showNewDayMessage();
        }
    }

    // Show new day message (optional visual feedback)
    showNewDayMessage() {
        // Could add a toast notification here
        console.log('New day started! Dashboard reset.');
    }

    // Load data from localStorage and update UI
    loadFromLocalStorage() {
        // Set dark mode
        if (this.data.darkMode) {
            document.body.setAttribute('data-theme', 'dark');
            document.getElementById('darkModeToggle').textContent = '☀️';
        }

        // Load habit states
        this.habits.forEach(habit => {
            const checkbox = document.getElementById(habit);
            if (checkbox && this.data.habits[habit]) {
                checkbox.checked = true;
            }
        });

        // Load mood
        if (this.data.mood) {
            const moodBtn = document.querySelector(`[data-mood="${this.data.mood}"]`);
            if (moodBtn) {
                moodBtn.classList.add('selected');
            }
        }

        // Load water intake
        this.updateWaterDisplay();
    }

    // Toggle dark mode
    toggleDarkMode() {
        const body = document.body;
        const isDark = body.getAttribute('data-theme') === 'dark';
        
        if (isDark) {
            body.removeAttribute('data-theme');
            document.getElementById('darkModeToggle').textContent = '🌙';
            this.data.darkMode = false;
        } else {
            body.setAttribute('data-theme', 'dark');
            document.getElementById('darkModeToggle').textContent = '☀️';
            this.data.darkMode = true;
        }
        
        this.saveData();
        
        // Add animation feedback
        document.getElementById('darkModeToggle').classList.add('pulse');
        setTimeout(() => {
            document.getElementById('darkModeToggle').classList.remove('pulse');
        }, 600);
    }

    // Update habit completion status
    updateHabit(habitId, completed) {
        this.data.habits[habitId] = completed;
        this.saveData();
        this.updateHabitsProgress();
        this.updateStats();
        
        // Add visual feedback
        const checkbox = document.getElementById(habitId);
        if (checkbox) {
            checkbox.closest('.habit-item').classList.add('bounce');
            setTimeout(() => {
                checkbox.closest('.habit-item').classList.remove('bounce');
            }, 600);
        }
    }

    // Update mood selection
    updateMood(mood) {
        // Remove previous selection
        document.querySelectorAll('.mood-btn').forEach(btn => {
            btn.classList.remove('selected');
        });
        
        // Add selection to clicked mood
        const selectedBtn = document.querySelector(`[data-mood="${mood}"]`);
        if (selectedBtn) {
            selectedBtn.classList.add('selected');
            selectedBtn.classList.add('pulse');
            setTimeout(() => {
                selectedBtn.classList.remove('pulse');
            }, 600);
        }
        
        this.data.mood = mood;
        this.saveData();
        this.updateMoodDisplay();
        this.updateStats();
    }

    // Update mood display text
    updateMoodDisplay() {
        const moodDisplay = document.getElementById('moodDisplay');
        const moodMap = {
            'terrible': { emoji: '😫', text: 'Having a tough day', color: '#e53e3e' },
            'bad': { emoji: '😔', text: 'Not feeling great', color: '#dd6b20' },
            'okay': { emoji: '😐', text: 'Doing okay', color: '#d69e2e' },
            'good': { emoji: '😊', text: 'Feeling good!', color: '#38a169' },
            'amazing': { emoji: '🤩', text: 'Amazing day!', color: '#3182ce' }
        };
        
        if (this.data.mood && moodMap[this.data.mood]) {
            const mood = moodMap[this.data.mood];
            moodDisplay.innerHTML = `
                <div style="color: ${mood.color}; font-size: 2rem; margin-bottom: 0.5rem;">${mood.emoji}</div>
                <p><strong>${mood.text}</strong></p>
            `;
        } else {
            moodDisplay.innerHTML = '<p>Select your mood for today</p>';
        }
    }

    // Update water intake
    updateWater(change) {
        const newAmount = this.data.water + change;
        
        // Ensure water amount stays within reasonable bounds (0-12 glasses)
        if (newAmount >= 0 && newAmount <= 12) {
            this.data.water = newAmount;
            this.saveData();
            this.updateWaterDisplay();
            this.updateStats();
            
            // Add visual feedback
            const waterBottle = document.querySelector('.water-bottle');
            waterBottle.classList.add('pulse');
            setTimeout(() => {
                waterBottle.classList.remove('pulse');
            }, 600);
        }
    }

    // Update water display visualization
    updateWaterDisplay() {
        const waterFill = document.getElementById('waterFill');
        const waterLevel = document.getElementById('waterLevel');
        const percentage = Math.min((this.data.water / 8) * 100, 100);
        
        waterFill.style.height = `${percentage}%`;
        waterLevel.textContent = `${this.data.water}/8`;
        
        // Change color based on progress
        if (percentage >= 100) {
            waterFill.style.background = 'linear-gradient(180deg, #48bb78, #68d391)';
        } else if (percentage >= 50) {
            waterFill.style.background = 'linear-gradient(180deg, #4299e1, #63b3ed)';
        } else {
            waterFill.style.background = 'linear-gradient(180deg, #ed8936, #f6ad55)';
        }
    }

    // Update habits progress bar
    updateHabitsProgress() {
        const completedCount = Object.values(this.data.habits).filter(Boolean).length;
        const totalHabits = this.habits.length;
        const percentage = (completedCount / totalHabits) * 100;
        
        document.getElementById('habitsProgress').style.width = `${percentage}%`;
        document.getElementById('habitsProgressText').textContent = `${completedCount}/${totalHabits} completed`;
    }

    // Update all stats in overview card
    updateStats() {
        // Completed habits count
        const completedHabits = Object.values(this.data.habits).filter(Boolean).length;
        document.getElementById('completedHabits').textContent = completedHabits;
        
        // Current mood emoji
        const moodMap = {
            'terrible': '😫',
            'bad': '😔',
            'okay': '😐',
            'good': '😊',
            'amazing': '🤩'
        };
        document.getElementById('currentMood').textContent = this.data.mood ? moodMap[this.data.mood] : '-';
        
        // Water glasses
        document.getElementById('waterGlasses').textContent = this.data.water;
        
        // Overall daily score calculation
        const habitScore = (completedHabits / this.habits.length) * 40; // 40% weight
        const moodScore = this.data.mood ? this.getMoodScore() * 30 : 0; // 30% weight
        const waterScore = Math.min((this.data.water / 8), 1) * 30; // 30% weight
        const overallScore = Math.round(habitScore + moodScore + waterScore);
        
        document.getElementById('overallScore').textContent = `${overallScore}%`;
        
        // Update score color based on performance
        const scoreElement = document.getElementById('overallScore');
        if (overallScore >= 80) {
            scoreElement.style.color = '#48bb78'; // Green
        } else if (overallScore >= 60) {
            scoreElement.style.color = '#ed8936'; // Orange
        } else {
            scoreElement.style.color = '#e53e3e'; // Red
        }
    }

    // Convert mood to numerical score for overall calculation
    getMoodScore() {
        const moodScores = {
            'terrible': 0.2,
            'bad': 0.4,
            'okay': 0.6,
            'good': 0.8,
            'amazing': 1.0
        };
        return moodScores[this.data.mood] || 0;
    }

    // Reset all daily data
    resetDay() {
        if (confirm('Are you sure you want to reset all today\'s data?')) {
            // Reset data but preserve dark mode preference
            this.data = {
                date: this.getTodayString(),
                habits: {},
                mood: null,
                water: 0,
                darkMode: this.data.darkMode
            };
            
            // Reset UI elements
            this.habits.forEach(habit => {
                const checkbox = document.getElementById(habit);
                if (checkbox) checkbox.checked = false;
            });
            
            document.querySelectorAll('.mood-btn').forEach(btn => {
                btn.classList.remove('selected');
            });
            
            // Save and update
            this.saveData();
            this.updateWaterDisplay();
            this.updateHabitsProgress();
            this.updateMoodDisplay();
            this.updateStats();
            
            // Visual feedback
            document.getElementById('resetBtn').classList.add('pulse');
            setTimeout(() => {
                document.getElementById('resetBtn').classList.remove('pulse');
            }, 600);
        }
    }

    // Update all UI components
    updateUI() {
        this.updateHabitsProgress();
        this.updateMoodDisplay();
        this.updateWaterDisplay();
        this.updateStats();
    }
}

// Initialize the dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new LifeDashboard();
});

// Additional utility functions

// Smooth scroll for better UX (if adding internal navigation later)
function smoothScroll(target) {
    document.querySelector(target).scrollIntoView({
        behavior: 'smooth'
    });
}

// Format date helper function
function formatDate(date) {
    return new Intl.DateTimeFormat('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    }).format(date);
}

// Add keyboard shortcuts for better accessibility
document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + D for dark mode toggle
    if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
        e.preventDefault();
        document.getElementById('darkModeToggle').click();
    }
    
    // Ctrl/Cmd + R for reset (prevent default browser refresh)
    if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
        e.preventDefault();
        document.getElementById('resetBtn').click();
    }
});

// Service worker registration for potential PWA features (optional)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        // Could register a service worker here for offline functionality
        console.log('Life Dashboard loaded successfully!');
    });
}
