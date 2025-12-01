// Default blocks
const DEFAULT_BLOCKS = [
    {
        id: 'default-1',
        title: 'Official Delta Executor',
        content: `https://delta-executor.com/download/`,
        editable: false
    },
    {
        id: 'default-2',
        title: 'Old SpeedHub',
        content: `loadstring(game:HttpGet("https://raw.githubusercontent.com/AhmadV99/Script-Games/c2aef94de9c32eadcb6a8bd56e8adbe59123d510/Grow%20a%20Garden.lua"))()`,
        editable: false
    },
    {
        id: 'default-3',
        title: 'NatHub',
        content: `loadstring(game:HttpGet("https://raw.githubusercontent.com/dy1zn4t/NatHub/refs/heads/main/loader"))();`,
        editable: false
    }
];

// State
let blocks = [];
let searchQuery = '';
let editingBlockId = null;

// Initialize
function init() {
    loadBlocks();
    renderBlocks();
    attachEventListeners();
}

// Load blocks from localStorage
function loadBlocks() {
    const storedBlocks = localStorage.getItem('codeBlocks');
    const userBlocks = storedBlocks ? JSON.parse(storedBlocks) : [];
    blocks = [...DEFAULT_BLOCKS, ...userBlocks];
}

// Save user blocks to localStorage
function saveBlocks() {
    const userBlocks = blocks.filter(block => block.editable);
    localStorage.setItem('codeBlocks', JSON.stringify(userBlocks));
}

// Filter blocks
function getFilteredBlocks() {
    if (!searchQuery.trim()) {
        return blocks;
    }
    const query = searchQuery.toLowerCase();
    return blocks.filter(block => 
        block.title.toLowerCase().includes(query) ||
        block.content.toLowerCase().includes(query)
    );
}

// Render blocks
function renderBlocks() {
    const container = document.getElementById('blocks-container');
    const filteredBlocks = getFilteredBlocks();

    if (filteredBlocks.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="16 18 22 12 16 6"></polyline>
                    <polyline points="8 6 2 12 8 18"></polyline>
                </svg>
                <p>No code blocks found</p>
                <p class="hint">${searchQuery ? 'Try a different search term' : 'Click the + button to add your first block!'}</p>
            </div>
        `;
        return;
    }

    container.innerHTML = filteredBlocks.map(block => createBlockHTML(block)).join('');
    
    // Attach event listeners for each block
    filteredBlocks.forEach(block => {
        attachBlockEventListeners(block.id);
    });
}

// Create block HTML
function createBlockHTML(block) {
    const isEditing = editingBlockId === block.id;
    
    return `
        <div class="block-card" data-block-id="${block.id}">
            <div class="title-row">
                ${isEditing ? `
                    <input type="text" class="block-title editing" id="edit-title-${block.id}" value="${escapeHtml(block.title)}" maxlength="50">
                ` : `
                    <h3 class="block-title">${escapeHtml(block.title)}</h3>
                    ${!block.editable ? '<span class="badge-default">Default</span>' : ''}
                `}
            </div>
            
            <div class="actions">
                <button class="btn" data-action="copy" data-block-id="${block.id}">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                    </svg>
                    <span>Copy</span>
                </button>
                
                ${block.editable ? (isEditing ? `
                    <button class="btn btn-success" data-action="save" data-block-id="${block.id}">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                        <span>Save</span>
                    </button>
                    <button class="btn btn-secondary" data-action="cancel" data-block-id="${block.id}">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                        <span>Cancel</span>
                    </button>
                ` : `
                    <button class="btn btn-primary" data-action="edit" data-block-id="${block.id}">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
                        </svg>
                        <span>Edit</span>
                    </button>
                    <button class="btn btn-delete" data-action="delete" data-block-id="${block.id}">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                        <span>Delete</span>
                    </button>
                `) : ''}
            </div>
            
            <div class="code-content">
                ${isEditing ? `
                    <textarea id="edit-content-${block.id}" spellcheck="false">${escapeHtml(block.content)}</textarea>
                ` : `
                    <pre>${escapeHtml(block.content)}</pre>
                `}
            </div>
        </div>
    `;
}

// Attach event listeners for a specific block
function attachBlockEventListeners(blockId) {
    const blockElement = document.querySelector(`[data-block-id="${blockId}"]`);
    if (!blockElement) return;

    const buttons = blockElement.querySelectorAll('[data-action]');
    buttons.forEach(button => {
        button.addEventListener('click', handleBlockAction);
    });
}

// Handle block actions
function handleBlockAction(e) {
    const action = e.currentTarget.dataset.action;
    const blockId = e.currentTarget.dataset.blockId;
    const block = blocks.find(b => b.id === blockId);

    if (!block) return;

    switch (action) {
        case 'copy':
            copyBlock(block);
            break;
        case 'edit':
            startEditBlock(blockId);
            break;
        case 'save':
            saveEditBlock(blockId);
            break;
        case 'cancel':
            cancelEditBlock();
            break;
        case 'delete':
            deleteBlock(blockId, block);
            break;
    }
}

// Copy block
function copyBlock(block) {
    // Use textarea fallback method which is more reliable
    const textArea = document.createElement('textarea');
    textArea.value = block.content;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    textArea.setAttribute('readonly', '');
    document.body.appendChild(textArea);
    
    textArea.select();
    textArea.setSelectionRange(0, textArea.value.length);
    
    let successful = false;
    try {
        successful = document.execCommand('copy');
    } catch (err) {
        console.error('execCommand failed:', err);
    }
    
    document.body.removeChild(textArea);
    
    if (successful) {
        showToast('Copied to clipboard!', 'success');
    } else {
        // Try clipboard API as fallback
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(block.content)
                .then(() => showToast('Copied to clipboard!', 'success'))
                .catch(() => showToast('Copy failed. Please copy manually.', 'error'));
        } else {
            showToast('Copy failed. Please copy manually.', 'error');
        }
    }
}

// Start editing block
function startEditBlock(blockId) {
    editingBlockId = blockId;
    renderBlocks();
}

// Save edited block
function saveEditBlock(blockId) {
    const titleInput = document.getElementById(`edit-title-${blockId}`);
    const contentInput = document.getElementById(`edit-content-${blockId}`);
    
    if (!titleInput || !contentInput) return;
    
    const newTitle = titleInput.value.trim();
    const newContent = contentInput.value.trim();
    
    if (!newTitle || !newContent) {
        showToast('Title and content cannot be empty', 'error');
        return;
    }
    
    const blockIndex = blocks.findIndex(b => b.id === blockId);
    if (blockIndex !== -1) {
        blocks[blockIndex] = {
            ...blocks[blockIndex],
            title: newTitle,
            content: newContent
        };
        saveBlocks();
        editingBlockId = null;
        renderBlocks();
        showToast('Changes saved!', 'success');
    }
}

// Cancel editing block
function cancelEditBlock() {
    editingBlockId = null;
    renderBlocks();
    showToast('Edit cancelled', 'info');
}

// Delete block
function deleteBlock(blockId, block) {
    if (!confirm(`Delete "${block.title}"?`)) return;
    
    blocks = blocks.filter(b => b.id !== blockId);
    saveBlocks();
    renderBlocks();
    showToast('Block deleted', 'success');
}

// Add new block
function addBlock(title, content) {
    const newBlock = {
        id: `user-${Date.now()}`,
        title: title.trim(),
        content: content.trim(),
        editable: true
    };
    
    blocks.push(newBlock);
    saveBlocks();
    renderBlocks();
    showToast('Block added successfully!', 'success');
}

// Modal functions
function openModal() {
    const modal = document.getElementById('modal');
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
    
    // Focus on title input
    setTimeout(() => {
        document.getElementById('new-title').focus();
    }, 100);
}

function closeModal() {
    const modal = document.getElementById('modal');
    modal.classList.remove('open');
    document.body.style.overflow = '';
    
    // Clear form
    document.getElementById('new-title').value = '';
    document.getElementById('new-content').value = '';
}

// Toast notification
function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.remove();
    }, 3000);
}

// Escape HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Attach event listeners
function attachEventListeners() {
    // Search
    const searchInput = document.getElementById('search-input');
    searchInput.addEventListener('input', (e) => {
        searchQuery = e.target.value;
        renderBlocks();
    });
    
    // FAB button
    const fabButton = document.getElementById('fab-button');
    fabButton.addEventListener('click', openModal);
    
    // Modal close button
    const modalClose = document.querySelector('.modal-close');
    modalClose.addEventListener('click', closeModal);
    
    // Modal backdrop
    const modalBackdrop = document.querySelector('.modal-backdrop');
    modalBackdrop.addEventListener('click', closeModal);
    
    // Add block form
    const form = document.getElementById('add-block-form');
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const title = document.getElementById('new-title').value.trim();
        const content = document.getElementById('new-content').value.trim();
        
        if (!title) {
            showToast('Please enter a title', 'error');
            document.getElementById('new-title').focus();
            return;
        }
        
        if (!content) {
            showToast('Please enter some code or text', 'error');
            document.getElementById('new-content').focus();
            return;
        }
        
        addBlock(title, content);
        closeModal();
    });
    
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        // Escape key - close modal
        if (e.key === 'Escape') {
            const modal = document.getElementById('modal');
            if (modal.classList.contains('open')) {
                closeModal();
            }
        }
        
        // Ctrl/Cmd + Enter - submit form when in textarea
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            const newContent = document.getElementById('new-content');
            if (document.activeElement === newContent) {
                e.preventDefault();
                form.dispatchEvent(new Event('submit'));
            }
        }
    });
    
    // Enter key on title input - focus content
    const titleInput = document.getElementById('new-title');
    titleInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            document.getElementById('new-content').focus();
        }
    });
}

// Initialize on load
document.addEventListener('DOMContentLoaded', init);
