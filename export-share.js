// Export and Social Sharing Utilities
// Handles PDF export and social media sharing

// Export results as PDF (using html2canvas + jsPDF)
async function exportResultsAsPDF(groupId) {
    try {
        showLoading('Generating PDF...');

        // Get group details
        const details = await getGroupDetails(groupId);

        // For now, use browser print dialog
        // TODO: Integrate jsPDF and html2canvas libraries for custom PDF
        window.print();

        hideLoading();
    } catch (error) {
        hideLoading();
        showError('Failed to export PDF: ' + error.message);
    }
}

// Generate social sharing card image
async function generateSocialCard(groupData) {
    // Create a canvas with group results
    const canvas = document.createElement('canvas');
    canvas.width = 1200;
    canvas.height = 630; // Twitter/Facebook card size

    const ctx = canvas.getContext('2d');

    // Background gradient
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, '#667eea');
    gradient.addColorStop(1, '#764ba2');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Title
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 60px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(groupData.groupName, canvas.width / 2, 150);

    // Subtitle
    ctx.font = '40px Arial';
    ctx.fillText(groupData.title, canvas.width / 2, 220);

    // Harmony Score
    ctx.font = 'bold 120px Arial';
    ctx.fillText(`${groupData.harmonyScore}%`, canvas.width / 2, 380);

    ctx.font = '36px Arial';
    ctx.fillText('Group Harmony', canvas.width / 2, 440);

    // Members count
    ctx.font = '32px Arial';
    ctx.fillText(`${groupData.memberCount} Members`, canvas.width / 2, 520);

    // Logo/Branding
    ctx.font = 'bold 28px Arial';
    ctx.fillText('Compatibility Chaos', canvas.width / 2, 590);

    // Convert to blob
    return new Promise((resolve) => {
        canvas.toBlob(resolve, 'image/png');
    });
}

// Share results on social media
async function shareOnSocial(platform, groupData) {
    const url = window.location.href;
    const text = `Check out our group compatibility results! ${groupData.harmonyScore}% harmony across ${groupData.memberCount} members 🎉`;

    let shareUrl;

    switch (platform) {
        case 'twitter':
            shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
            break;

        case 'facebook':
            shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
            break;

        case 'linkedin':
            shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
            break;

        case 'whatsapp':
            shareUrl = `https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`;
            break;

        case 'telegram':
            shareUrl = `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`;
            break;

        default:
            // Use Web Share API if available
            if (navigator.share) {
                try {
                    await navigator.share({
                        title: groupData.groupName,
                        text: text,
                        url: url
                    });
                    return;
                } catch (error) {
                    console.error('Share failed:', error);
                    return;
                }
            }

            // Fallback: copy to clipboard
            navigator.clipboard.writeText(url);
            alert('Link copied to clipboard!');
            return;
    }

    // Open share URL in new window
    window.open(shareUrl, '_blank', 'width=600,height=400');
}

// Download sharing card as image
async function downloadSharingCard(groupData) {
    try {
        showLoading('Generating image...');

        const blob = await generateSocialCard(groupData);
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = `${groupData.groupName.replace(/\s+/g, '-')}-results.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        hideLoading();
    } catch (error) {
        hideLoading();
        showError('Failed to generate image: ' + error.message);
    }
}

// Add share buttons to results page
function addShareButtons(groupData) {
    const container = document.getElementById('share-buttons');
    if (!container) return;

    container.innerHTML = `
        <div class="share-section">
            <h3>📤 Share Results</h3>
            <div class="share-buttons">
                <button onclick="shareOnSocial('twitter', ${JSON.stringify(groupData)})" class="share-btn twitter">
                    <span>🐦</span> Twitter
                </button>
                <button onclick="shareOnSocial('facebook', ${JSON.stringify(groupData)})" class="share-btn facebook">
                    <span>📘</span> Facebook
                </button>
                <button onclick="shareOnSocial('whatsapp', ${JSON.stringify(groupData)})" class="share-btn whatsapp">
                    <span>💬</span> WhatsApp
                </button>
                <button onclick="downloadSharingCard(${JSON.stringify(groupData)})" class="share-btn download">
                    <span>📥</span> Download Card
                </button>
                <button onclick="exportResultsAsPDF('${groupData.groupId}')" class="share-btn pdf">
                    <span>📄</span> Export PDF
                </button>
            </div>
        </div>
    `;
}

// Add print styles for PDF export
const printStyles = `
@media print {
    body * {
        visibility: hidden;
    }

    #group-results-page,
    #group-results-page * {
        visibility: visible;
    }

    #group-results-page {
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
    }

    .action-buttons,
    .share-buttons,
    .back-link {
        display: none !important;
    }

    .results-container {
        padding: 1rem;
    }

    .matrix-table {
        font-size: 10px;
    }
}
`;

// Inject print styles
const styleSheet = document.createElement('style');
styleSheet.textContent = printStyles;
document.head.appendChild(styleSheet);
