// ESLint 9.x flat config format
// Modern configuration for JavaScript linting

export default [
    {
        // Global ignores
        ignores: [
            'node_modules/**',
            'dist/**',
            'build/**',
            '.vercel/**',
            '*.min.js'
        ]
    },
    {
        // Configuration for all JS files
        files: ['**/*.js'],
        languageOptions: {
            ecmaVersion: 2022,
            sourceType: 'module',
            globals: {
                // Browser globals
                window: 'readonly',
                document: 'readonly',
                navigator: 'readonly',
                console: 'readonly',
                alert: 'readonly',
                fetch: 'readonly',
                localStorage: 'readonly',
                sessionStorage: 'readonly',
                URL: 'readonly',
                URLSearchParams: 'readonly',
                FormData: 'readonly',
                setTimeout: 'readonly',
                setInterval: 'readonly',
                clearTimeout: 'readonly',
                clearInterval: 'readonly',
                Promise: 'readonly',
                btoa: 'readonly',
                atob: 'readonly',
                prompt: 'readonly',
                confirm: 'readonly',
                event: 'readonly',
                location: 'readonly',

                // Supabase globals (from CDN)
                supabase: 'readonly',

                // Custom globals from our app
                supabaseClient: 'writable',
                questions: 'readonly',
                scenarios: 'readonly',
                currentUser: 'writable',

                // Group compatibility globals
                currentQuestion: 'writable',
                userAnswers: 'writable',

                // App-wide functions (can be called but not defined in every file)
                handleCreateGroup: 'readonly',
                handleJoinGroup: 'readonly',
                handleGroupQuizComplete: 'readonly',
                showGroupCreated: 'readonly',
                startGroupQuiz: 'readonly',
                showQuestion: 'readonly',
                selectOption: 'readonly',
                nextQuestion: 'readonly',
                previousQuestion: 'readonly',
                completeQuiz: 'readonly',
                copyGroupCode: 'readonly',
                copyShareUrl: 'readonly',
                copyCurrentUrl: 'readonly',
                shareResults: 'readonly',
                showJoinInput: 'readonly',
                quickJoin: 'readonly',
                manualCheckForUpdates: 'readonly',
                refreshResults: 'readonly',
                showNavbar: 'readonly',
                hideNavbar: 'readonly',
                switchAuthTab: 'readonly',
                checkForSharedLink: 'readonly',

                // User settings functions
                showUserSettings: 'readonly',
                closeSettings: 'readonly',
                handleChangePassword: 'readonly',
                confirmAccountDeletion: 'readonly',
                handleAccountDeletion: 'readonly',
                showAuthLoading: 'readonly',
                hideAuthLoading: 'readonly',
                signInWithProviderEnhanced: 'readonly',
                handleGoogleLoginEnhanced: 'readonly',
                handleFacebookLoginEnhanced: 'readonly',
                handleGitHubLoginEnhanced: 'readonly',
                handleTwitterLoginEnhanced: 'readonly',
                showFeedback: 'readonly',
                hideFeedback: 'readonly',
                populateUserInfo: 'readonly',
                createSettingsPage: 'readonly',

                // Analytics functions
                trackAnswerPatterns: 'readonly',
                getAnalyticsData: 'readonly',
                displayAnalyticsDashboard: 'readonly',

                // Database and API helpers
                callLLMAPI: 'readonly',
                sendEmailNotification: 'readonly',
                getQuizSession: 'readonly',
                createQuizSession: 'readonly',
                saveResult: 'readonly',
                getUserSessions: 'readonly',
                getSessionResults: 'readonly',
                sendWelcomeEmail: 'readonly',
                sendResultsEmail: 'readonly',
                sendResponseNotification: 'readonly',
                showAuthPage: 'readonly',
                showDashboard: 'readonly',

                // Functions defined in other files
                initSupabase: 'readonly',
                showPage: 'readonly',
                showLoading: 'readonly',
                hideLoading: 'readonly',
                showError: 'readonly',
                showInfo: 'readonly',
                generatePersonalityInsights: 'readonly',
                calculateCompatibility: 'readonly',

                // Group helper functions
                createGroupSession: 'readonly',
                getGroupSession: 'readonly',
                joinGroupSession: 'readonly',
                getGroupMembers: 'readonly',
                submitGroupMemberAnswers: 'readonly',
                getCompletedMembers: 'readonly',
                calculateGroupCompatibility: 'readonly',
                getGroupDetails: 'readonly',
                generateGroupDynamics: 'readonly',
                generateFallbackGroupAnalysis: 'readonly',
                generateCompatibilityAnalysis: 'readonly',

                // Export/share functions
                exportResultsAsPDF: 'readonly',
                shareOnSocial: 'readonly',
                downloadSharingCard: 'readonly',

                // Leaderboard functions
                getLeaderboardData: 'readonly',
                displayLeaderboard: 'readonly',
                escapeHtml: 'readonly'
            }
        },
        rules: {
            // Error prevention
            'no-unused-vars': ['warn', {
                argsIgnorePattern: '^_',
                varsIgnorePattern: '^_'
            }],
            'no-undef': 'error',
            'no-console': 'off', // Allow console for debugging

            // Best practices
            'eqeqeq': ['error', 'always'],
            'no-eval': 'error',
            'no-implied-eval': 'error',
            'no-new-func': 'error',

            // Style (warnings only)
            'semi': ['warn', 'always'],
            'quotes': ['warn', 'single', { allowTemplateLiterals: true }],
            'indent': 'off', // Disabled - codebase uses mixed 2/4 space indentation

            // Modern JS
            'prefer-const': 'warn',
            'prefer-arrow-callback': 'warn',
            'no-var': 'warn'
        }
    },
    {
        // Specific configuration for Node.js API files
        files: ['api/**/*.js', 'scripts/**/*.js'],
        languageOptions: {
            ecmaVersion: 2022,
            sourceType: 'module',
            globals: {
                // Node.js globals
                process: 'readonly',
                __dirname: 'readonly',
                __filename: 'readonly',
                module: 'readonly',
                require: 'readonly',
                exports: 'writable',
                console: 'readonly',
                Buffer: 'readonly',
                setTimeout: 'readonly',
                setInterval: 'readonly',
                clearTimeout: 'readonly',
                clearInterval: 'readonly',
                Promise: 'readonly',
                fetch: 'readonly',
                URL: 'readonly'
            }
        },
        rules: {
            'no-console': 'off' // Allow console in server-side code
        }
    }
];
