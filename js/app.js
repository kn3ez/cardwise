// CardWise — Main Application
// Multi-page design with sidebar navigation

(function() {
  'use strict';

  // ==========================================
  //  State Management
  // ==========================================
  const STORAGE_KEYS = {
    wallet: 'cardwise_wallet',
    perks: 'cardwise_perks_used',
    expanded: 'cardwise_expanded',
    anniversaries: 'cardwise_anniversaries'
  };

  let state = {
    wallet: [],
    perksUsed: {},
    expanded: {},
    anniversaries: {} // cardId -> 'MM-DD' format
  };

  let currentPage = 'advisor';
  let cardFilter = 'all';
  let cardSearchQuery = '';
  let activeCategory = null;

  function loadState() {
    try {
      const w = localStorage.getItem(STORAGE_KEYS.wallet);
      const p = localStorage.getItem(STORAGE_KEYS.perks);
      const e = localStorage.getItem(STORAGE_KEYS.expanded);
      const a = localStorage.getItem(STORAGE_KEYS.anniversaries);
      state.wallet = w ? JSON.parse(w) : [...DEFAULT_WALLET];
      state.perksUsed = p ? JSON.parse(p) : {};
      state.expanded = e ? JSON.parse(e) : {};
      state.anniversaries = a ? JSON.parse(a) : {};
    } catch (err) {
      console.warn('Failed to load state:', err);
      state.wallet = [...DEFAULT_WALLET];
      state.perksUsed = {};
      state.expanded = {};
      state.anniversaries = {};
    }
  }

  function saveState() {
    try {
      localStorage.setItem(STORAGE_KEYS.wallet, JSON.stringify(state.wallet));
      localStorage.setItem(STORAGE_KEYS.perks, JSON.stringify(state.perksUsed));
      localStorage.setItem(STORAGE_KEYS.expanded, JSON.stringify(state.expanded));
      localStorage.setItem(STORAGE_KEYS.anniversaries, JSON.stringify(state.anniversaries));
    } catch (err) {
      console.warn('Failed to save state:', err);
    }
  }

  function setAnniversary(cardId, date) {
    if (date) {
      state.anniversaries[cardId] = date; // 'MM-DD' format
    } else {
      delete state.anniversaries[cardId];
    }
    saveState();
    renderCardsPage();
    renderCalendar();
    showToast('✓', 'Anniversary date saved');
  }

  function getAnniversary(cardId) {
    return state.anniversaries[cardId] || null;
  }

  function getWalletCards() {
    return state.wallet.map(id => CARDS_DB.find(c => c.id === id)).filter(Boolean);
  }

  function isInWallet(cardId) {
    return state.wallet.includes(cardId);
  }

  function addToWallet(cardId) {
    if (!isInWallet(cardId)) {
      state.wallet.push(cardId);
      saveState();
      renderAll();
      showToast('✓', 'Card added');
    }
  }

  function removeFromWallet(cardId) {
    state.wallet = state.wallet.filter(id => id !== cardId);
    const card = CARDS_DB.find(c => c.id === cardId);
    if (card) {
      card.perks.forEach(p => { delete state.perksUsed[p.id]; });
    }
    saveState();
    renderAll();
    showToast('✓', 'Card removed');
  }

  function togglePerk(perkId) {
    state.perksUsed[perkId] = !state.perksUsed[perkId];
    saveState();
    renderBenefits();
    renderDashboard();
  }

  function toggleExpand(cardId) {
    state.expanded[cardId] = !state.expanded[cardId];
    saveState();
    const section = document.querySelector(`.benefit-section[data-card-id="${cardId}"]`);
    if (section) section.classList.toggle('expanded', state.expanded[cardId]);
  }

  function resetAllPerks() {
    if (confirm('Reset all perk tracking?')) {
      state.perksUsed = {};
      saveState();
      renderAll();
      showToast('✓', 'All perks reset');
    }
  }

  // ==========================================
  //  Toast
  // ==========================================
  function showToast(icon, message, duration = 2000) {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `<span class="toast-icon">${icon}</span><span>${message}</span>`;
    container.appendChild(toast);
    setTimeout(() => {
      toast.classList.add('removing');
      setTimeout(() => toast.remove(), 200);
    }, duration);
  }

  // ==========================================
  //  Navigation
  // ==========================================
  function navigateTo(page) {
    currentPage = page;
    
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById(`page-${page}`)?.classList.add('active');
    
    document.querySelectorAll('.nav-item, .mobile-nav-item').forEach(link => {
      link.classList.toggle('active', link.dataset.page === page);
    });

    // Render the page content
    if (page === 'cards') renderCardsPage();
    if (page === 'benefits') renderBenefits();
    if (page === 'optimizer') renderOptimizer();
    if (page === 'calendar') renderCalendar();
  }

  // ==========================================
  //  Merchant → Category Mapping
  // ==========================================
  const MERCHANT_MAP = {
    'amazon': 'online_shopping', 'target': 'online_shopping', 'ebay': 'online_shopping',
    'etsy': 'online_shopping', 'best buy': 'online_shopping', 'bestbuy': 'online_shopping',
    'walmart': 'groceries', 'costco': 'groceries', 'trader joe': 'groceries',
    'whole foods': 'groceries', 'aldi': 'groceries', 'kroger': 'groceries',
    'safeway': 'groceries', 'publix': 'groceries', 'wegmans': 'groceries',
    'uber eats': 'dining', 'doordash': 'dining', 'grubhub': 'dining',
    'chipotle': 'dining', 'starbucks': 'dining', 'mcdonald': 'dining',
    'chick-fil-a': 'dining', 'panera': 'dining', 'sweetgreen': 'dining',
    'cheesecake factory': 'dining', 'restaurant': 'dining', 'dinner': 'dining',
    'lunch': 'dining', 'brunch': 'dining', 'coffee': 'dining', 'cafe': 'dining',
    'netflix': 'streaming', 'spotify': 'streaming', 'hulu': 'streaming',
    'disney': 'streaming', 'hbo': 'streaming', 'apple tv': 'streaming',
    'peacock': 'streaming', 'max': 'streaming', 'youtube': 'streaming',
    'delta': 'flights', 'united': 'flights', 'american airlines': 'flights',
    'southwest': 'flights', 'jetblue': 'flights', 'flight': 'flights', 'airline': 'flights',
    'hilton': 'hotels', 'marriott': 'hotels', 'hyatt': 'hotels',
    'airbnb': 'hotels', 'hotel': 'hotels', 'vrbo': 'hotels',
    'shell': 'gas', 'exxon': 'gas', 'bp': 'gas', 'chevron': 'gas', 'fuel': 'gas',
    'lyft': 'transit', 'uber': 'transit', 'metro': 'transit', 'subway': 'transit',
    'cvs': 'drugstore', 'walgreens': 'drugstore', 'pharmacy': 'drugstore'
  };

  function matchCategory(query) {
    const q = query.toLowerCase().trim();
    if (!q) return null;

    const directCat = SPENDING_CATEGORIES.find(cat =>
      cat.name.toLowerCase().includes(q) ||
      cat.description.toLowerCase().includes(q)
    );
    if (directCat) return directCat;

    for (const [merchant, catId] of Object.entries(MERCHANT_MAP)) {
      if (merchant.includes(q) || q.includes(merchant)) {
        return SPENDING_CATEGORIES.find(c => c.id === catId);
      }
    }

    return SPENDING_CATEGORIES.find(c => c.id === 'general');
  }

  // ==========================================
  //  Advisor Page
  // ==========================================
  const QUICK_CATS = [
    { id: 'dining', label: 'Dining', icon: '🍽️' },
    { id: 'groceries', label: 'Groceries', icon: '🛒' },
    { id: 'gas', label: 'Gas', icon: '⛽' },
    { id: 'flights', label: 'Flights', icon: '✈️' },
    { id: 'hotels', label: 'Hotels', icon: '🏨' },
    { id: 'online_shopping', label: 'Shopping', icon: '🛍️' },
    { id: 'transit', label: 'Transit', icon: '🚗' },
    { id: 'streaming', label: 'Streaming', icon: '📺' },
    { id: 'drugstore', label: 'Drugstore', icon: '💊' },
    { id: 'general', label: 'Other', icon: '💳' }
  ];

  function renderCategoryChips() {
    const container = document.getElementById('categoryChips');
    container.innerHTML = QUICK_CATS.map(c => `
      <button class="chip ${activeCategory === c.id ? 'active' : ''}" data-cat="${c.id}">
        <span class="chip-icon">${c.icon}</span>
        ${c.label}
      </button>
    `).join('');
  }

  function renderAdvisorResult(categoryId) {
    const container = document.getElementById('advisorResult');
    const walletCards = getWalletCards();

    if (walletCards.length === 0) {
      container.innerHTML = `
        <div class="result-empty">
          <p>Add cards to your wallet first. <a href="#" onclick="CardWise.navigate('cards'); return false;">Go to Cards →</a></p>
        </div>`;
      return;
    }

    if (!categoryId) {
      container.innerHTML = '';
      return;
    }

    const cat = SPENDING_CATEGORIES.find(c => c.id === categoryId);
    if (!cat) { container.innerHTML = ''; return; }

    const ranked = walletCards
      .map(card => {
        const catData = card.categoryMap[cat.id];
        return {
          card,
          rate: catData ? catData.rate : 0,
          label: catData ? catData.label : '1x',
          portal: catData ? catData.portal : null, // portal is now an object or null
          note: catData ? catData.note : ''
        };
      })
      .sort((a, b) => b.rate - a.rate);

    const winner = ranked[0];
    const runner = ranked.length > 1 && ranked[1].rate > 0 ? ranked[1] : null;

    // Build note HTML - show regular note, or portal bonus if available
    let noteHtml = '';
    if (winner.note) {
      noteHtml = `<div class="result-note">${winner.note}</div>`;
    }
    // Show portal bonus as separate tip
    let portalHtml = '';
    if (winner.portal) {
      portalHtml = `<div class="result-portal">💡 ${winner.portal.label} ${winner.portal.note}</div>`;
    }

    let runnerHtml = '';
    if (runner) {
      runnerHtml = `
        <div class="result-runner">
          <span class="runner-label">Runner up:</span>
          <span>${runner.card.issuer} ${runner.card.name}</span>
          <span class="runner-rate">${runner.label}</span>
        </div>`;
    }

    container.innerHTML = `
      <div class="result-card">
        <div class="result-winner">
          <div class="result-badge">🏆</div>
          <div class="result-info">
            <div class="result-label">Best Card</div>
            <div class="result-card-name">${winner.card.issuer} ${winner.card.name}</div>
            ${noteHtml}
            ${portalHtml}
          </div>
          <div class="result-rate">${winner.label}</div>
        </div>
        ${runnerHtml}
      </div>`;
  }

  function handleAdvisorSearch(query) {
    if (!query.trim()) {
      activeCategory = null;
      renderCategoryChips();
      renderAdvisorResult(null);
      return;
    }
    const cat = matchCategory(query);
    if (cat) {
      activeCategory = cat.id;
      renderCategoryChips();
      renderAdvisorResult(cat.id);
    }
  }

  function handleCategoryClick(catId) {
    activeCategory = activeCategory === catId ? null : catId;
    document.getElementById('advisorSearch').value = '';
    renderCategoryChips();
    renderAdvisorResult(activeCategory);
  }

  // ==========================================
  //  Perk Period Helpers
  // ==========================================
  
  // Get number of periods for a frequency type
  function getPeriodsForFrequency(freq) {
    switch (freq) {
      case 'monthly': return 12;
      case 'quarterly': return 4;
      case 'semiannual': return 2;
      case 'annual': return 1;
      default: return 0;
    }
  }

  // Get period labels
  function getPeriodLabels(freq) {
    switch (freq) {
      case 'monthly': return ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      case 'quarterly': return ['Q1', 'Q2', 'Q3', 'Q4'];
      case 'semiannual': return ['H1', 'H2'];
      case 'annual': return ['Year'];
      default: return [];
    }
  }

  // Check if a specific period is used
  function isPeriodUsed(perkId, period) {
    const perkState = state.perksUsed[perkId];
    if (!perkState) return false;
    if (typeof perkState === 'boolean') return perkState;
    return perkState[period] === true;
  }

  // Toggle a specific period
  function togglePerkPeriod(perkId, period, totalPeriods) {
    if (!state.perksUsed[perkId] || typeof state.perksUsed[perkId] === 'boolean') {
      state.perksUsed[perkId] = {};
    }
    state.perksUsed[perkId][period] = !state.perksUsed[perkId][period];
    saveState();
    renderBenefits();
    renderDashboard();
  }

  // Count used periods for a perk
  function countUsedPeriods(perkId, totalPeriods) {
    const perkState = state.perksUsed[perkId];
    if (!perkState) return 0;
    if (typeof perkState === 'boolean') return perkState ? totalPeriods : 0;
    return Object.values(perkState).filter(v => v === true).length;
  }

  // Calculate used value considering periods
  function calculateUsedValue(perk) {
    const periods = getPeriodsForFrequency(perk.frequency);
    if (periods === 0) return 0;
    const usedPeriods = countUsedPeriods(perk.id, periods);
    const valuePerPeriod = perk.value / periods;
    return usedPeriods * valuePerPeriod;
  }

  // ==========================================
  //  Dashboard Stats (My Cards page only)
  // ==========================================
  function renderDashboard() {
    const walletCards = getWalletCards();

    const totalFees = walletCards.reduce((sum, c) => sum + c.annualFee, 0);
    let totalValue = 0;
    let usedValue = 0;

    walletCards.forEach(card => {
      card.perks.forEach(perk => {
        if (perk.value > 0) {
          totalValue += perk.value;
          usedValue += calculateUsedValue(perk);
        }
      });
    });

    const net = totalValue - totalFees;
    const unusedValue = totalValue - usedValue;

    const container = document.getElementById('dashboardCards');
    container.innerHTML = `
      <div class="stat-card">
        <div class="stat-icon">💳</div>
        <div class="stat-label">Cards</div>
        <div class="stat-value">${walletCards.length}</div>
        <div class="stat-detail">$${totalFees.toLocaleString()} in fees</div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">✨</div>
        <div class="stat-label">Perk Value</div>
        <div class="stat-value">$${totalValue.toLocaleString()}</div>
        <div class="stat-detail">Total annual benefits</div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">✅</div>
        <div class="stat-label">Used</div>
        <div class="stat-value">$${Math.round(usedValue).toLocaleString()}</div>
        <div class="stat-detail">${Math.round((usedValue / totalValue || 0) * 100)}% claimed</div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">📈</div>
        <div class="stat-label">Net Value</div>
        <div class="stat-value ${net >= 0 ? 'positive' : 'negative'}">${net >= 0 ? '+' : ''}$${Math.abs(net).toLocaleString()}</div>
        <div class="stat-detail">Perks − fees</div>
      </div>
    `;

    // Update sidebar summary
    document.getElementById('sidebarSummary').innerHTML = `
      <div class="summary-label">Wallet</div>
      <div class="summary-value">${walletCards.length} card${walletCards.length !== 1 ? 's' : ''}</div>
    `;
  }

  // ==========================================
  //  Cards Page
  // ==========================================
  function renderCardsPage() {
    renderWalletGrid();
    renderCardList();
    document.getElementById('walletCount').textContent = state.wallet.length;
  }

  function renderWalletGrid() {
    const container = document.getElementById('walletGrid');
    const walletCards = getWalletCards();

    if (walletCards.length === 0) {
      container.innerHTML = `
        <div class="wallet-empty">
          <p>No cards yet. Add some from the list below.</p>
        </div>`;
      return;
    }

    container.innerHTML = walletCards.map(card => {
      const anniversary = getAnniversary(card.id);
      const anniversaryDisplay = anniversary ? formatAnniversary(anniversary) : 'Set anniversary';
      const anniversaryClass = anniversary ? '' : 'not-set';
      
      return `
        <div class="wallet-card" data-card-id="${card.id}">
          <div class="wallet-card-swatch" style="background: ${card.gradient};"></div>
          <div class="wallet-card-info">
            <div class="wallet-card-name">${card.issuer} ${card.name}</div>
            <div class="wallet-card-meta">${card.annualFee === 0 ? 'No fee' : '$' + card.annualFee + '/yr'} · ${card.perks.length} perks</div>
            <button class="wallet-card-anniversary ${anniversaryClass}" onclick="CardWise.editAnniversary('${card.id}', event)">
              📅 ${anniversaryDisplay}
            </button>
          </div>
          <button class="wallet-card-remove" onclick="event.stopPropagation(); CardWise.removeFromWallet('${card.id}')" title="Remove">✕</button>
        </div>`;
    }).join('');
  }

  function formatAnniversary(mmdd) {
    const [month, day] = mmdd.split('-').map(Number);
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${monthNames[month - 1]} ${day}`;
  }

  function editAnniversary(cardId, event) {
    event.stopPropagation();
    const card = CARDS_DB.find(c => c.id === cardId);
    if (!card) return;

    const current = getAnniversary(cardId) || '';
    
    // Create modal
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
      <div class="modal">
        <div class="modal-header">
          <h3>Card Anniversary</h3>
          <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">✕</button>
        </div>
        <div class="modal-body">
          <p class="modal-card-name">${card.issuer} ${card.name}</p>
          <p class="modal-desc">Set the date your card renews each year. This helps calculate when annual perks expire.</p>
          <div class="date-picker">
            <select id="anniversaryMonth" class="date-select">
              <option value="">Month</option>
              ${['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
                .map((m, i) => `<option value="${String(i + 1).padStart(2, '0')}" ${current.startsWith(String(i + 1).padStart(2, '0')) ? 'selected' : ''}>${m}</option>`)
                .join('')}
            </select>
            <select id="anniversaryDay" class="date-select">
              <option value="">Day</option>
              ${Array.from({length: 31}, (_, i) => i + 1)
                .map(d => `<option value="${String(d).padStart(2, '0')}" ${current.endsWith('-' + String(d).padStart(2, '0')) ? 'selected' : ''}>${d}</option>`)
                .join('')}
            </select>
          </div>
        </div>
        <div class="modal-footer">
          ${current ? `<button class="btn btn-ghost btn-danger" onclick="CardWise.saveAnniversary('${cardId}', null); this.closest('.modal-overlay').remove();">Clear</button>` : ''}
          <button class="btn btn-secondary" onclick="this.closest('.modal-overlay').remove()">Cancel</button>
          <button class="btn btn-primary" onclick="CardWise.saveAnniversaryFromModal('${cardId}')">Save</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
    
    // Close on backdrop click
    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.remove();
    });
  }

  function saveAnniversaryFromModal(cardId) {
    const month = document.getElementById('anniversaryMonth').value;
    const day = document.getElementById('anniversaryDay').value;
    
    if (month && day) {
      setAnniversary(cardId, `${month}-${day}`);
    }
    document.querySelector('.modal-overlay')?.remove();
  }

  function getFilteredCards() {
    let cards = [...CARDS_DB];

    if (cardFilter === 'no-fee') {
      cards = cards.filter(c => c.annualFee === 0);
    } else if (cardFilter !== 'all') {
      cards = cards.filter(c => c.issuer === cardFilter);
    }

    if (cardSearchQuery) {
      const q = cardSearchQuery.toLowerCase();
      cards = cards.filter(c =>
        c.name.toLowerCase().includes(q) ||
        c.issuer.toLowerCase().includes(q)
      );
    }

    return cards;
  }

  function renderCardList() {
    const container = document.getElementById('cardList');
    const cards = getFilteredCards();

    if (cards.length === 0) {
      container.innerHTML = `<div style="padding: 20px; text-align: center; color: var(--text-muted);">No cards found</div>`;
      return;
    }

    container.innerHTML = cards.map(card => {
      const inWallet = isInWallet(card.id);
      return `
        <div class="card-list-item">
          <div class="card-list-swatch" style="background: ${card.gradient};"></div>
          <div class="card-list-info">
            <div class="card-list-name">${card.issuer} ${card.name}</div>
            <div class="card-list-meta">${card.annualFee === 0 ? 'No fee' : '$' + card.annualFee + '/yr'} · ${card.network}</div>
          </div>
          <div class="card-list-action">
            ${inWallet 
              ? `<span class="in-wallet">✓ Added</span>` 
              : `<button class="btn btn-sm btn-secondary" onclick="CardWise.addToWallet('${card.id}')">+ Add</button>`
            }
          </div>
        </div>`;
    }).join('');
  }

  // ==========================================
  //  Benefits Page
  // ==========================================
  function renderBenefits() {
    const walletCards = getWalletCards();
    const container = document.getElementById('benefitsList');

    if (walletCards.length === 0) {
      container.innerHTML = `
        <div style="text-align: center; padding: 48px; color: var(--text-muted);">
          Add cards to track benefits. <a href="#" onclick="CardWise.navigate('cards'); return false;" style="color: var(--accent);">Go to Cards</a>
        </div>`;
      return;
    }

    container.innerHTML = walletCards.map(card => {
      const isExpanded = state.expanded[card.id];
      const totalVal = card.perks.reduce((s, p) => s + p.value, 0);
      const usedVal = card.perks.reduce((s, p) => s + calculateUsedValue(p), 0);

      return `
        <div class="benefit-section ${isExpanded ? 'expanded' : ''}" data-card-id="${card.id}">
          <div class="benefit-header" onclick="CardWise.toggleExpand('${card.id}')">
            <div class="benefit-swatch" style="background: ${card.gradient};"></div>
            <div class="benefit-title">
              <h3>${card.issuer} ${card.name}</h3>
              <p>${card.perks.length} perks · ${card.annualFee === 0 ? 'No fee' : '$' + card.annualFee + '/yr'}</p>
            </div>
            <div class="benefit-progress">
              <div class="benefit-progress-value">$${totalVal.toLocaleString()}</div>
              <div class="benefit-progress-label">$${Math.round(usedVal)} used</div>
            </div>
            <span class="benefit-chevron">▾</span>
          </div>
          <div class="benefit-perks">
            ${card.perks.map(perk => renderPerkItem(perk)).join('')}
          </div>
        </div>`;
    }).join('');
  }

  function renderPerkItem(perk) {
    const periods = getPeriodsForFrequency(perk.frequency);
    const labels = getPeriodLabels(perk.frequency);
    const isTrackable = perk.value > 0 && periods > 0;
    const usedPeriods = countUsedPeriods(perk.id, periods);
    const allUsed = isTrackable && usedPeriods === periods;

    // For perks with multiple periods, show period checkboxes
    let checkboxesHtml = '';
    if (isTrackable && periods > 1) {
      checkboxesHtml = `
        <div class="perk-periods">
          ${labels.map((label, i) => {
            const isUsed = isPeriodUsed(perk.id, i);
            return `
              <label class="period-check ${isUsed ? 'checked' : ''}">
                <input type="checkbox" ${isUsed ? 'checked' : ''} 
                       onchange="CardWise.togglePerkPeriod('${perk.id}', ${i}, ${periods})">
                <span class="period-label">${label}</span>
              </label>`;
          }).join('')}
        </div>`;
    } else if (isTrackable) {
      // Single checkbox for annual
      const isUsed = isPeriodUsed(perk.id, 0);
      checkboxesHtml = `
        <input type="checkbox" class="perk-checkbox" ${isUsed ? 'checked' : ''} 
               onchange="CardWise.togglePerkPeriod('${perk.id}', 0, 1)">`;
    }

    return `
      <div class="perk-item ${allUsed ? 'used' : ''}">
        ${!isTrackable || periods > 1 ? '<div style="width: 20px;"></div>' : checkboxesHtml}
        <div class="perk-info">
          <div class="perk-name">${perk.name}</div>
          <div class="perk-desc">${perk.description}</div>
          ${isTrackable && periods > 1 ? checkboxesHtml : ''}
          <div class="perk-tags">
            ${perk.value > 0 ? `<span class="perk-tag value">$${perk.value}/yr</span>` : ''}
            <span class="perk-tag frequency">${formatFreq(perk.frequency)}</span>
            ${perk.monthlyValue ? `<span class="perk-tag">$${perk.monthlyValue}/mo</span>` : ''}
            ${isTrackable && periods > 1 ? `<span class="perk-tag">${usedPeriods}/${periods} used</span>` : ''}
          </div>
        </div>
      </div>`;
  }

  function formatFreq(freq) {
    return { annual: 'Annual', monthly: 'Monthly', quarterly: 'Quarterly', semiannual: 'Semi-annual', ongoing: 'Ongoing', 'one-time': 'One-time' }[freq] || freq;
  }

  // ==========================================
  //  Optimizer Page
  // ==========================================
  function renderOptimizer() {
    const container = document.getElementById('optimizerGrid');
    const walletCards = getWalletCards();

    if (walletCards.length === 0) {
      container.innerHTML = `
        <div class="optimizer-empty">
          Add cards to see optimization recommendations. <a href="#" onclick="CardWise.navigate('cards'); return false;" style="color: var(--accent);">Go to Cards</a>
        </div>`;
      return;
    }

    container.innerHTML = SPENDING_CATEGORIES.map(cat => {
      const ranked = walletCards
        .map(card => {
          const catData = card.categoryMap[cat.id];
          return { card, rate: catData ? catData.rate : 0, label: catData ? catData.label : '—' };
        })
        .sort((a, b) => b.rate - a.rate);

      const best = ranked[0];
      const others = ranked.slice(1);

      return `
        <div class="optimizer-card">
          <div class="optimizer-header">
            <span class="optimizer-icon">${cat.icon}</span>
            <div>
              <div class="optimizer-category">${cat.name}</div>
              <div class="optimizer-desc">${cat.description}</div>
            </div>
          </div>
          <div class="optimizer-best">
            <div class="optimizer-best-swatch" style="background: ${best.card.gradient};"></div>
            <div class="optimizer-best-info">
              <div class="optimizer-best-name">${best.card.issuer} ${best.card.name}</div>
            </div>
            <div class="optimizer-best-rate">${best.label}</div>
          </div>
          ${others.length > 0 ? `
            <div class="optimizer-others">
              ${others.slice(0, 2).map(o => `
                <div class="optimizer-other">
                  <span class="optimizer-other-dot" style="background: ${o.card.accentColor};"></span>
                  <span class="optimizer-other-name">${o.card.issuer} ${o.card.name}</span>
                  <span class="optimizer-other-rate">${o.label}</span>
                </div>`).join('')}
            </div>` : ''}
        </div>`;
    }).join('');
  }

  // ==========================================
  //  Calendar Page
  // ==========================================
  function renderCalendar() {
    const events = generateCalendarEvents();
    const container = document.getElementById('upcomingEvents');

    if (events.length === 0) {
      container.innerHTML = `<p style="color: var(--text-muted);">Add cards with trackable perks to see upcoming deadlines.</p>`;
      return;
    }

    container.innerHTML = `
      <h3>Upcoming (${events.length} events)</h3>
      ${events.slice(0, 8).map(evt => `
        <div class="event-item">
          <span class="event-icon">${evt.id.includes('-week') ? '🔔' : '🚨'}</span>
          <div class="event-info">
            <div class="event-title">${evt.title.substring(0, 50)}${evt.title.length > 50 ? '...' : ''}</div>
            <div class="event-date">${formatDateDisplay(evt.date)}</div>
          </div>
        </div>`).join('')}
      ${events.length > 8 ? `<p style="color: var(--text-muted); margin-top: 12px;">+ ${events.length - 8} more events</p>` : ''}
    `;
  }

  function generateCalendarEvents() {
    const events = [];
    const walletCards = getWalletCards();
    const now = new Date();

    walletCards.forEach(card => {
      card.perks.forEach(perk => {
        if (perk.frequency === 'ongoing' || perk.frequency === 'one-time' || perk.value === 0) return;

        const expDate = getExpirationDate(perk, card.id);
        if (!expDate || expDate < now) return;

        const weekBefore = new Date(expDate);
        weekBefore.setDate(weekBefore.getDate() - 7);

        const title = `Use ${card.issuer} ${card.name} ${perk.name}`;
        const desc = `${perk.name} worth $${perk.value}. ${perk.description}`;

        if (weekBefore > now) {
          events.push({
            id: `${perk.id}-week`,
            title: `🔔 ${title} (expires ${formatDateDisplay(expDate)})`,
            description: desc,
            dateStr: formatDateICS(weekBefore),
            date: weekBefore,
            alarm: true
          });
        }

        events.push({
          id: `${perk.id}-day`,
          title: `🚨 LAST DAY: ${title}`,
          description: desc,
          dateStr: formatDateICS(expDate),
          date: expDate,
          alarm: true
        });
      });
    });

    events.sort((a, b) => a.date - b.date);
    return events;
  }

  function getExpirationDate(perk, cardId) {
    const now = new Date();
    const year = now.getFullYear();

    if (perk.frequency === 'monthly') {
      return new Date(year, now.getMonth() + 1, 0);
    }
    if (perk.frequency === 'quarterly') {
      const quarter = Math.floor(now.getMonth() / 3);
      return new Date(year, (quarter + 1) * 3, 0);
    }
    if (perk.frequency === 'annual') {
      // Use card anniversary if set, otherwise default to end of year
      const anniversary = getAnniversary(cardId);
      if (anniversary) {
        const [month, day] = anniversary.split('-').map(Number);
        // Anniversary is when card renews, so perks expire the day before
        let expYear = year;
        const expDate = new Date(expYear, month - 1, day);
        expDate.setDate(expDate.getDate() - 1); // Day before renewal
        
        // If already passed this year, use next year
        if (expDate < now) {
          expDate.setFullYear(expYear + 1);
        }
        return expDate;
      }
      return new Date(year, 11, 31);
    }
    return null;
  }

  function formatDateICS(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}${m}${d}`;
  }

  function formatDateDisplay(date) {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  function generateICS(events) {
    let ics = [
      'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//CardWise//EN',
      'CALSCALE:GREGORIAN', 'METHOD:PUBLISH', 'X-WR-CALNAME:CardWise Reminders'
    ];

    events.forEach(evt => {
      const uid = `cardwise-${evt.id}@cardwise`;
      ics.push(
        'BEGIN:VEVENT',
        `UID:${uid}`,
        `DTSTART;VALUE=DATE:${evt.dateStr}`,
        `SUMMARY:${escapeICS(evt.title)}`,
        `DESCRIPTION:${escapeICS(evt.description)}`,
        'BEGIN:VALARM', 'TRIGGER:-PT0M', 'ACTION:DISPLAY', `DESCRIPTION:${escapeICS(evt.title)}`, 'END:VALARM',
        'END:VEVENT'
      );
    });

    ics.push('END:VCALENDAR');
    return ics.join('\r\n');
  }

  function escapeICS(str) {
    return str.replace(/[\\;,\n]/g, m => ({ '\\': '\\\\', ';': '\\;', ',': '\\,', '\n': '\\n' }[m] || m));
  }

  function downloadCalendar() {
    const events = generateCalendarEvents();
    if (events.length === 0) {
      showToast('📅', 'No events to export');
      return;
    }

    const icsContent = generateICS(events);
    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'cardwise-reminders.ics';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showToast('✓', `Downloaded ${events.length} events`);
  }

  // ==========================================
  //  Event Listeners
  // ==========================================
  function setupEventListeners() {
    // Navigation
    document.querySelectorAll('.nav-item, .mobile-nav-item').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        navigateTo(link.dataset.page);
      });
    });

    // Advisor search
    document.getElementById('advisorSearch').addEventListener('input', (e) => {
      handleAdvisorSearch(e.target.value);
    });

    // Category chips
    document.getElementById('categoryChips').addEventListener('click', (e) => {
      const chip = e.target.closest('.chip');
      if (chip) handleCategoryClick(chip.dataset.cat);
    });

    // Cards page filters
    document.getElementById('issuerFilters').addEventListener('click', (e) => {
      if (e.target.classList.contains('pill')) {
        document.querySelectorAll('#issuerFilters .pill').forEach(p => p.classList.remove('active'));
        e.target.classList.add('active');
        cardFilter = e.target.dataset.filter;
        renderCardList();
      }
    });

    // Card search
    document.getElementById('cardSearch').addEventListener('input', (e) => {
      cardSearchQuery = e.target.value;
      renderCardList();
    });

    // Benefits buttons
    document.getElementById('expandAllBtn').addEventListener('click', () => {
      const walletCards = getWalletCards();
      const allExpanded = walletCards.every(c => state.expanded[c.id]);
      walletCards.forEach(c => { state.expanded[c.id] = !allExpanded; });
      saveState();
      renderBenefits();
    });

    document.getElementById('resetPerksBtn').addEventListener('click', resetAllPerks);

    // Calendar download
    document.getElementById('downloadIcsBtn').addEventListener('click', downloadCalendar);

    // Keyboard shortcut
    document.addEventListener('keydown', (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        navigateTo('advisor');
        document.getElementById('advisorSearch').focus();
      }
    });
  }

  // ==========================================
  //  Render All
  // ==========================================
  function renderAll() {
    renderCategoryChips();
    renderAdvisorResult(activeCategory);
    renderDashboard();
    renderCardsPage();
    renderBenefits();
    renderOptimizer();
    renderCalendar();
  }

  // ==========================================
  //  Initialize
  // ==========================================
  function init() {
    loadState();
    renderAll();
    setupEventListeners();
  }

  // Expose methods
  window.CardWise = {
    addToWallet,
    removeFromWallet,
    togglePerk,
    togglePerkPeriod,
    toggleExpand,
    navigate: navigateTo,
    editAnniversary,
    saveAnniversary: setAnniversary,
    saveAnniversaryFromModal
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
