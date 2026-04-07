$(document).ready(function() {
    // Form submission handler
    $('#tokenForm').on('submit', function(e) {
        e.preventDefault();
        const accessToken = $('#accessToken').val().trim();
        
        if (!accessToken) {
            showAlert('Please enter a valid access token', 'danger');
            return;
        }
        
        generateScreenshots(accessToken);
    });
    
    // Download all screenshots button
    $('#downloadAllBtn').on('click', function() {
        downloadAllScreenshots();
    });
});

// Main function to generate screenshots
async function generateScreenshots(accessToken) {
    try {
        // Show loading screen
        showLoading();
        updateProgress(10);
        
        // Call API
        const response = await fetch('/inventory/capture-all', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ accessToken: accessToken })
        });
        
        updateProgress(50);
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to generate screenshots');
        }
        
        const data = await response.json();
        updateProgress(80);
        
        if (data.success) {
            displayScreenshots(data.data);
            updateProgress(100);
            
            setTimeout(() => {
                hideLoading();
                showResults();
                showAlert('Screenshots generated successfully!', 'success');
            }, 500);
        } else {
            throw new Error('API returned unsuccessful response');
        }
        
    } catch (error) {
        console.error('Error generating screenshots:', error);
        hideLoading();
        showAlert(`Error: ${error.message}`, 'danger');
    }
}

// Display screenshots in the UI
function displayScreenshots(data) {
    // Store screenshots globally for download
    window.screenshotData = data;
    
    // Display account info screenshot
    $('#infoScreenshot').attr('src', data.infoScreenshot);
    
    // Display inventory screenshots
    const inventoryContainer = $('#inventoryScreenshots');
    inventoryContainer.empty();
    
    data.inventoryScreenshots.forEach((screenshot, index) => {
        const screenshotHtml = `
            <div class="col-md-6 col-lg-4 screenshot-item fade-in-up" style="animation-delay: ${index * 0.1}s">
                <div class="card bg-secondary border-dark">
                    <div class="card-header bg-dark text-white text-center">
                        <small>Batch ${screenshot.batchIndex + 1}</small>
                    </div>
                    <div class="card-body p-2">
                        <img src="${screenshot.image}" 
                             class="img-fluid rounded" 
                             alt="Inventory Batch ${screenshot.batchIndex + 1}" 
                             id="inventoryImg_${screenshot.batchIndex}" />
                        <div class="text-center mt-2">
                            <button class="btn btn-sm btn-outline-primary" 
                                    onclick="downloadImage('inventoryImg_${screenshot.batchIndex}', 'inventory-batch-${screenshot.batchIndex + 1}.png')">
                                <i class="fas fa-download"></i>
                                Download
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        inventoryContainer.append(screenshotHtml);
    });
    
    // Update batch count
    $('#batchCount').text(`${data.totalBatches} batch${data.totalBatches !== 1 ? 'es' : ''}`);
}

// Download all screenshots as ZIP
async function downloadAllScreenshots() {
    if (!window.screenshotData) {
        showAlert('No screenshots available to download', 'warning');
        return;
    }
    
    try {
        const zip = new JSZip();
        const data = window.screenshotData;
        
        // Add account info screenshot
        const infoBase64 = data.infoScreenshot.split(',')[1];
        zip.file('account-info.png', infoBase64, { base64: true });
        
        // Add inventory screenshots
        data.inventoryScreenshots.forEach((screenshot, index) => {
            const imageBase64 = screenshot.image.split(',')[1];
            zip.file(`inventory-batch-${screenshot.batchIndex + 1}.png`, imageBase64, { base64: true });
        });
        
        // Generate and download ZIP
        const content = await zip.generateAsync({ type: 'blob' });
        const url = window.URL.createObjectURL(content);
        const link = document.createElement('a');
        link.href = url;
        link.download = `valorant-inventory-${new Date().toISOString().split('T')[0]}.zip`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        
        showAlert('All screenshots downloaded successfully!', 'success');
        
    } catch (error) {
        console.error('Error downloading screenshots:', error);
        showAlert('Failed to download screenshots', 'danger');
    }
}

// Download individual image
function downloadImage(imgId, filename) {
    const img = document.getElementById(imgId);
    if (!img) return;
    
    const link = document.createElement('a');
    link.href = img.src;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// UI Helper Functions
function showLoading() {
    $('#loadingSection').show();
    $('#resultsSection').hide();
    $('#generateBtn').prop('disabled', true).html('<i class="fas fa-spinner fa-spin"></i> Processing...');
}

function hideLoading() {
    $('#loadingSection').hide();
    $('#generateBtn').prop('disabled', false).html('<i class="fas fa-camera"></i> Generate Screenshots');
    updateProgress(0);
}

function showResults() {
    $('#resultsSection').show();
}

function updateProgress(percentage) {
    $('#progressBar').css('width', percentage + '%').attr('aria-valuenow', percentage);
}

function showAlert(message, type) {
    // Remove existing alerts
    $('.alert').remove();
    
    const alertHtml = `
        <div class="alert alert-${type} alert-dismissible fade show" role="alert">
            <i class="fas fa-${getAlertIcon(type)}"></i>
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        </div>
    `;
    
    $('.container .row .col-lg-8').prepend(alertHtml);
    
    // Auto-dismiss success alerts
    if (type === 'success') {
        setTimeout(() => {
            $('.alert-success').alert('close');
        }, 5000);
    }
}

function getAlertIcon(type) {
    const icons = {
        'success': 'check-circle',
        'danger': 'exclamation-circle',
        'warning': 'exclamation-triangle',
        'info': 'info-circle'
    };
    return icons[type] || 'info-circle';
}

// Load JSZip library dynamically
function loadJSZip() {
    if (typeof JSZip !== 'undefined') return Promise.resolve();
    
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js';
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
    });
}

// Load JSZip when page loads
$(document).ready(function() {
    loadJSZip().catch(error => {
        console.error('Failed to load JSZip library:', error);
        showAlert('Download functionality may be limited', 'warning');
    });
});

// Add image click to view full size
$(document).on('click', '.screenshot-item img', function() {
    const imgSrc = $(this).attr('src');
    const modal = `
        <div class="modal fade" id="imageModal" tabindex="-1">
            <div class="modal-dialog modal-xl">
                <div class="modal-content bg-dark">
                    <div class="modal-header border-secondary">
                        <h5 class="modal-title text-white">Screenshot Preview</h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body text-center">
                        <img src="${imgSrc}" class="img-fluid" alt="Screenshot" />
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Remove existing modal
    $('#imageModal').remove();
    
    // Add and show new modal
    $('body').append(modal);
    $('#imageModal').modal('show');
});