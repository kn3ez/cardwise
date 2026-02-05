// CardWise — Main Application Logic
// Vanilla JS, localStorage persistence, .ics export
// Redesigned with Advisor, Searchable Card Selector, Wallet Tags

(function() {
  'use strict';

  // ==========================================
  //  State Management
  // ==========================================
  const STORAGE_KEYS = {
    wallet: 'cardwise_wallet',
    perks: 'cardwise_perks_used',
    expanded: 'cardwise_expanded'
  };

  let state = {
    wallet: [],
    perksUsed: {},
    expanded: {}
  };

  function loadState() {
    try {
      const w = localStorage.getItem(STORAGE_KEYS.wallet);
      const p = localStorage.getItem(STORAGE_KEYS.perks);
      const e = localStorage.getItem(STORAGE_KEYS.expanded);
      state.wallet = w ? JSON.parse(w) : [...DEFAULT_WALLET];
      state.perksUsed = p ? JSON.parse(p) : {};
      state.expanded = e ? JSON.parse(e) : {};
    } catch (err) {
      console.warn('Failed to load state:', err);
      state.wallet = [...DEFAULT_WALLET];
      state.perksUsed = {};
      state.expanded = {};
    }
  }

  function saveState() {
    try {
      localStorage.setItem(STORAGE_KEYS.wallet, JSON.stringify(state.wallet));
      localStorage.setItem(STORAGE_KEYS.perks, JSON.stringify(state.perksUsed));
      localStorage.setItem(STORAGE_KEYS.expanded, JSON.stringify(state.expanded));
    } catch (err) {
      console.warn('Failed to save state:', err);
    }
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
      showToast('✅', 'Card added to wallet');
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
    showToast('🗑️', 'Card removed from wallet');
  }

  function togglePerk(perkId) {
    state.perksUsed[perkId] = !state.perksUsed[perkId];
    saveState();
    renderDashboard();
    renderBenefits();
  }

  function toggleExpand(cardId) {
    state.expanded[cardId] = !state.expanded[cardId];
    saveState();
  }

  function resetAllPerks() {
    state.perksUsed = {};
    saveState();
    renderAll();
    showToast('🔄', 'All perks reset');
  }

  // ==========================================
  //  Toast Notifications
  // ==========================================
  function showToast(icon, message, duration = 2500) {
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
  //  Merchant → Category Mapping
  // ==========================================
  const MERCHANT_MAP = {
    'amazon': 'online_shopping', 'target': 'online_shopping', 'ebay': 'online_shopping',
    'etsy': 'online_shopping', 'best buy': 'online_shopping', 'bestbuy': 'online_shopping',
    'walmart': 'groceries', 'costco': 'groceries', 'trader joe': 'groceries',
    'whole foods': 'groceries', 'aldi': 'groceries', 'kroger': 'groceries',
    'safeway': 'groceries', 'publix': 'groceries', 'wegmans': 'groceries',
    'sprouts': 'groceries', 'heb': 'groceries', 'h-e-b': 'groceries',
    'uber eats': 'dining', 'doordash': 'dining', 'grubhub': 'dining',
    'chipotle': 'dining', 'starbucks': 'dining', 'mcdonald': 'dining',
    'chick-fil-a': 'dining', 'panera': 'dining', 'sweetgreen': 'dining',
    'cheesecake factory': 'dining', 'olive garden': 'dining', 'sushi': 'dining',
    'pizza': 'dining', 'burger': 'dining', 'taco': 'dining', 'ramen': 'dining',
    'brunch': 'dining', 'dinner': 'dining', 'lunch': 'dining', 'restaurant': 'dining',
    'bar': 'dining', 'cafe': 'dining', 'coffee': 'dining',
    'netflix': 'streaming', 'spotify': 'streaming', 'hulu': 'streaming',
    'disney': 'streaming', 'hbo': 'streaming', 'apple tv': 'streaming',
    'peacock': 'streaming', 'paramount': 'streaming', 'youtube': 'streaming',
    'audible': 'streaming', 'apple music': 'streaming', 'max': 'streaming',
    'delta': 'flights', 'united': 'flights', 'american airlines': 'flights',
    'southwest': 'flights', 'jetblue': 'flights', 'frontier': 'flights',
    'spirit': 'flights', 'alaska airlines': 'flights', 'airline': 'flights',
    'plane': 'flights', 'flight': 'flights',
    'hilton': 'hotels', 'marriott': 'hotels', 'hyatt': 'hotels',
    'airbnb': 'hotels', 'hotel': 'hotels', 'vrbo': 'hotels',
    'motel': 'hotels', 'resort': 'hotels', 'ihg': 'hotels',
    'shell': 'gas', 'exxon': 'gas', 'bp': 'gas', 'chevron': 'gas',
    'mobil': 'gas', 'texaco': 'gas', 'sunoco': 'gas', 'fuel': 'gas',
    'lyft': 'transit', 'uber': 'transit', 'metro': 'transit',
    'subway': 'transit', 'bus': 'transit', 'taxi': 'transit', 'train': 'transit',
    'cvs': 'drugstore', 'walgreens': 'drugstore', 'rite aid': 'drugstore',
    'pharmacy': 'drugstore', 'drugstore': 'drugstore'
  };

  function matchCategory(query) {
    const q = query.toLowerCase().trim();
    if (!q) return null;

    // Direct category match
    const directCat = SPENDING_CATEGORIES.find(cat =>
      cat.name.toLowerCase().includes(q) ||
      cat.description.toLowerCase().includes(q) ||
      cat.id.replace('_', ' ').includes(q)
    );
    if (directCat) return directCat;

    // Merchant match
    for (const [merchant, catId] of Object.entries(MERCHANT_MAP)) {
      if (merchant.includes(q) || q.includes(merchant)) {
        return SPENDING_CATEGORIES.find(c => c.id === catId);
      }
    }

    // Fallback
    return SPENDING_CATEGORIES.find(c => c.id === 'general');
  }

  // ==========================================
  //  ADVISOR — "What Card Should I Use?"
  // ==========================================
  let activeAdvisorCat = null;

  // Quick category buttons for the advisor
  const ADVISOR_QUICK_CATS = [
    { id: 'dining', label: 'Dinner out', emoji: '🍽️' },
    { id: 'groceries', label: 'Groceries', emoji: '🛒' },
    { id: 'gas', label: 'Gas', emoji: '⛽' },
    { id: 'flights', label: 'Flight', emoji: '✈️' },
    { id: 'hotels', label: 'Hotel', emoji: '🏨' },
    { id: 'online_shopping', label: 'Online Shopping', emoji: '🛍️' },
    { id: 'transit', label: 'Uber / Lyft', emoji: '🚗' },
    { id: 'streaming', label: 'Streaming', emoji: '📺' },
    { id: 'drugstore', label: 'Drugstore', emoji: '💊' },
    { id: 'general', label: 'Other', emoji: '💳' }
  ];

  function renderAdvisorCategories() {
    const container = document.getElementById('advisorCategories');
    container.innerHTML = ADVISOR_QUICK_CATS.map(c => `
      <button class="advisor-cat-btn ${activeAdvisorCat === c.id ? 'active' : ''}" data-cat-id="${c.id}">
        <span class="cat-emoji">${c.emoji}</span> ${c.label}
      </button>
    `).join('');
  }

  function renderAdvisorResult(categoryId) {
    const container = document.getElementById('advisorResult');
    const walletCards = getWalletCards();

    if (walletCards.length === 0) {
      container.innerHTML = `
        <div class="advisor-no-cards">
          <p>Add cards to your wallet first! <a href="#browser">Browse cards →</a></p>
        </div>`;
      return;
    }

    if (!categoryId) {
      container.innerHTML = '';
      return;
    }

    const cat = SPENDING_CATEGORIES.find(c => c.id === categoryId);
    if (!cat) { container.innerHTML = ''; return; }

    // Rank cards
    const ranked = walletCards
      .map(card => {
        const catData = card.categoryMap[cat.id];
        return {
          card,
          rate: catData ? catData.rate : 0,
          label: catData ? catData.label : '1x',
          portal: catData ? catData.portal : false,
          note: catData ? catData.note : ''
        };
      })
      .sort((a, b) => b.rate - a.rate);

    const winner = ranked[0];
    const runnerUp = ranked.length > 1 ? ranked[1] : null;

    let noteHtml = '';
    if (winner.portal && winner.note) {
      noteHtml = `<div class="advisor-winner-note"><span class="portal-note">⚠️ ${winner.note}</span></div>`;
    } else if (winner.note) {
      noteHtml = `<div class="advisor-winner-note">${winner.note}</div>`;
    }

    let runnerHtml = '';
    if (runnerUp && runnerUp.rate > 0) {
      runnerHtml = `
        <div class="advisor-runner-up">
          <span class="advisor-runner-label">Runner up:</span>
          <span class="advisor-runner-name">${runnerUp.card.issuer} ${runnerUp.card.name}</span>
          <span class="advisor-runner-rate">${runnerUp.label}</span>
        </div>`;
    }

    container.innerHTML = `
      <div class="advisor-result-card">
        <div class="advisor-winner">
          <div class="advisor-winner-trophy">🏆</div>
          <div>
            <div class="advisor-winner-label">Recommended</div>
            <div class="advisor-winner-card">${winner.card.issuer} ${winner.card.name}</div>
          </div>
          <div class="advisor-winner-rate">${winner.label}</div>
        </div>
        ${noteHtml}
        ${runnerHtml}
      </div>`;
  }

  function handleAdvisorCatClick(catId) {
    activeAdvisorCat = activeAdvisorCat === catId ? null : catId;
    // Clear search input when using buttons
    document.getElementById('advisorSearchInput').value = '';
    renderAdvisorCategories();
    renderAdvisorResult(activeAdvisorCat);
  }

  function handleAdvisorSearch(query) {
    if (!query.trim()) {
      activeAdvisorCat = null;
      renderAdvisorCategories();
      renderAdvisorResult(null);
      return;
    }
    const cat = matchCategory(query);
    if (cat) {
      activeAdvisorCat = cat.id;
      renderAdvisorCategories();
      renderAdvisorResult(cat.id);
    }
  }

  // ==========================================
  //  Dashboard
  // ==========================================
  function renderDashboard() {
    const walletCards = getWalletCards();

    const totalFees = walletCards.reduce((sum, c) => sum + c.annualFee, 0);
    document.getElementById('totalFees').textContent = `$${totalFees.toLocaleString()}`;
    document.getElementById('totalFeesDetail').textContent = `${walletCards.length} card${walletCards.length !== 1 ? 's' : ''} in wallet`;

    let totalValue = 0;
    let totalPerks = 0;
    let unusedCount = 0;
    let unusedValue = 0;

    walletCards.forEach(card => {
      card.perks.forEach(perk => {
        if (perk.value > 0 && perk.frequency !== 'ongoing' && perk.frequency !== 'one-time') {
          totalPerks++;
          totalValue += perk.value;
          if (!state.perksUsed[perk.id]) {
            unusedCount++;
            unusedValue += perk.value;
          }
        } else if (perk.frequency === 'ongoing' && perk.value > 0) {
          totalValue += perk.value;
        }
      });
    });

    document.getElementById('totalPerkValue').textContent = `$${totalValue.toLocaleString()}`;
    document.getElementById('totalPerkDetail').textContent = `${totalPerks} trackable perks`;

    const net = totalValue - totalFees;
    const netEl = document.getElementById('netValue');
    netEl.textContent = `${net >= 0 ? '+' : ''}$${Math.abs(net).toLocaleString()}`;
    netEl.className = `stat-value ${net >= 0 ? 'positive' : 'negative'}`;

    document.getElementById('unusedPerks').textContent = unusedCount;
    document.getElementById('unusedPerksDetail').textContent = `Worth $${unusedValue.toLocaleString()} unclaimed`;

    renderAlerts(walletCards);
  }

  function renderAlerts(walletCards) {
    const container = document.getElementById('alertsContainer');
    const alerts = [];
    const now = new Date();
    const currentMonth = now.getMonth() + 1;

    walletCards.forEach(card => {
      card.perks.forEach(perk => {
        if (perk.frequency === 'monthly' && !state.perksUsed[perk.id]) {
          alerts.push({
            type: 'warning', icon: '⏰',
            text: `<span class="alert-card-name">${card.issuer} ${card.name}</span> — ${perk.name} resets monthly. Don't forget to use it!`
          });
        }
        if (perk.frequency === 'annual' && !state.perksUsed[perk.id] && perk.value > 50 && currentMonth >= 10) {
          alerts.push({
            type: 'danger', icon: '🔥',
            text: `<span class="alert-card-name">${card.issuer} ${card.name}</span> — ${perk.name} ($${perk.value}) expires at year end!`
          });
        }
        if (perk.frequency === 'quarterly' && !state.perksUsed[perk.id]) {
          alerts.push({
            type: 'warning', icon: '📋',
            text: `<span class="alert-card-name">${card.issuer} ${card.name}</span> — ${perk.name}. Make sure it's activated!`
          });
        }
      });

      const usedPerksCount = card.perks.filter(p => state.perksUsed[p.id] && p.frequency !== 'ongoing').length;
      const trackablePerks = card.perks.filter(p => p.frequency !== 'ongoing' && p.frequency !== 'one-time' && p.value > 0).length;
      if (card.annualFee >= 200 && trackablePerks > 0 && usedPerksCount === 0) {
        alerts.push({
          type: 'danger', icon: '💸',
          text: `<span class="alert-card-name">${card.issuer} ${card.name}</span> — $${card.annualFee}/yr fee but no perks used yet. Start claiming!`
        });
      }
    });

    if (alerts.length === 0 && walletCards.length > 0) {
      container.innerHTML = `
        <div class="alert-item" style="border-left-color: var(--success);">
          <span class="alert-icon">✅</span>
          <span class="alert-text">You're on track! No urgent actions needed.</span>
        </div>`;
      return;
    }

    if (walletCards.length === 0) {
      container.innerHTML = `
        <div class="alert-item">
          <span class="alert-icon">👋</span>
          <span class="alert-text">Add cards to your wallet to get started! Head to <a href="#browser">Browse Cards</a>.</span>
        </div>`;
      return;
    }

    container.innerHTML = alerts.slice(0, 5).map(a => `
      <div class="alert-item ${a.type}">
        <span class="alert-icon">${a.icon}</span>
        <span class="alert-text">${a.text}</span>
      </div>`).join('');
  }

  // ==========================================
  //  My Wallet
  // ==========================================
  function renderWallet() {
    const container = document.getElementById('walletScroll');
    const walletCards = getWalletCards();

    if (walletCards.length === 0) {
      container.innerHTML = `
        <div class="wallet-empty">
          <div class="empty-icon">💳</div>
          <p>Your wallet is empty. <a href="#browser">Browse cards</a> to get started.</p>
        </div>`;
      return;
    }

    container.innerHTML = walletCards.map(card => `
      <div class="credit-card" style="background: ${card.gradient}; color: ${card.textColor};" data-card-id="${card.id}">
        <button class="card-remove-btn" onclick="event.stopPropagation(); CardWise.removeFromWallet('${card.id}')" title="Remove from wallet">✕</button>
        <div class="card-issuer">${card.issuer}</div>
        <div class="card-chip"></div>
        <div class="card-bottom">
          <div class="card-name">${card.name}</div>
          <div class="card-fee">${card.annualFee === 0 ? 'No Fee' : '$' + card.annualFee + '/yr'}</div>
        </div>
      </div>`).join('');
  }

  // ==========================================
  //  Spending Optimizer
  // ==========================================
  function renderOptimizer(searchQuery = '') {
    const container = document.getElementById('optimizerGrid');
    const walletCards = getWalletCards();

    if (walletCards.length === 0) {
      container.innerHTML = `
        <div class="optimizer-empty" style="grid-column: 1 / -1;">
          <p>Add cards to your wallet to see spending recommendations.</p>
        </div>`;
      return;
    }

    const query = searchQuery.toLowerCase().trim();
    let categories = SPENDING_CATEGORIES;

    if (query) {
      categories = categories.filter(cat =>
        cat.name.toLowerCase().includes(query) ||
        cat.description.toLowerCase().includes(query)
      );

      for (const [merchant, catId] of Object.entries(MERCHANT_MAP)) {
        if (merchant.includes(query) || query.includes(merchant)) {
          const matchedCat = SPENDING_CATEGORIES.find(c => c.id === catId);
          if (matchedCat && !categories.find(c => c.id === matchedCat.id)) {
            categories.unshift(matchedCat);
          }
        }
      }

      if (categories.length === 0) {
        categories = [SPENDING_CATEGORIES.find(c => c.id === 'general')];
      }
    }

    container.innerHTML = categories.map(cat => {
      const ranked = walletCards
        .map(card => {
          const catData = card.categoryMap[cat.id];
          return {
            card,
            rate: catData ? catData.rate : 0,
            label: catData ? catData.label : '—'
          };
        })
        .sort((a, b) => b.rate - a.rate);

      const best = ranked[0];
      const others = ranked.slice(1);

      return `
        <div class="optimizer-card">
          <div class="category-header">
            <span class="category-icon">${cat.icon}</span>
            <div>
              <div class="category-name">${cat.name}</div>
              <div class="category-desc">${cat.description}</div>
            </div>
          </div>
          <div class="best-card-display">
            <div class="best-card-swatch" style="background: ${best.card.gradient};"></div>
            <div class="best-card-info">
              <div class="best-card-name">${best.card.issuer} ${best.card.name}</div>
              <div class="best-card-rate-label">Best rate</div>
            </div>
            <div>
              <div class="best-card-rate">${best.label}</div>
            </div>
          </div>
          ${others.length > 0 ? `
            <div class="other-cards-list">
              ${others.map(o => `
                <div class="other-card-row">
                  <span class="other-name">
                    <span class="card-dot" style="background: ${o.card.accentColor};"></span>
                    ${o.card.issuer} ${o.card.name}
                  </span>
                  <span class="other-rate">${o.label}</span>
                </div>`).join('')}
            </div>` : ''}
        </div>`;
    }).join('');
  }

  // ==========================================
  //  Benefits Tracker
  // ==========================================
  function renderBenefits() {
    const container = document.getElementById('benefitsList');
    const walletCards = getWalletCards();

    if (walletCards.length === 0) {
      container.innerHTML = `
        <div class="glass-card" style="text-align: center; padding: 48px;">
          <p class="text-muted">Add cards to your wallet to track benefits.</p>
        </div>`;
      return;
    }

    container.innerHTML = walletCards.map(card => {
      const isExpanded = state.expanded[card.id];
      const trackablePerks = card.perks.filter(p => p.value > 0 && p.frequency !== 'ongoing');
      const usedCount = trackablePerks.filter(p => state.perksUsed[p.id]).length;
      const totalVal = card.perks.reduce((s, p) => s + p.value, 0);

      return `
        <div class="benefit-card-section ${isExpanded ? 'expanded' : ''}" data-card-id="${card.id}">
          <div class="benefit-card-header" onclick="CardWise.toggleExpand('${card.id}')">
            <div class="benefit-card-left">
              <div class="benefit-card-swatch" style="background: ${card.gradient};"></div>
              <div>
                <div class="benefit-card-title">${card.issuer} ${card.name}</div>
                <div class="benefit-card-subtitle">${card.perks.length} perks · ${card.annualFee === 0 ? 'No fee' : '$' + card.annualFee + '/yr'}</div>
              </div>
            </div>
            <div class="benefit-card-right">
              <div class="benefit-progress">
                <div class="benefit-progress-label">${trackablePerks.length > 0 ? `${usedCount}/${trackablePerks.length} used` : 'Ongoing perks'}</div>
                <div class="benefit-progress-value">$${totalVal.toLocaleString()}</div>
              </div>
              <span class="benefit-chevron">▾</span>
            </div>
          </div>
          <div class="benefit-perks-list">
            ${card.perks.map(perk => {
              const isUsed = state.perksUsed[perk.id];
              const isTrackable = perk.value > 0 && perk.frequency !== 'ongoing';
              return `
                <div class="perk-item ${isUsed ? 'used' : ''}">
                  ${isTrackable ? `
                    <input type="checkbox" class="perk-checkbox" 
                           ${isUsed ? 'checked' : ''} 
                           onchange="CardWise.togglePerk('${perk.id}')"
                           aria-label="Mark ${perk.name} as used">
                  ` : '<div style="width: 22px; flex-shrink: 0;"></div>'}
                  <div class="perk-info">
                    <div class="perk-name">${perk.name}</div>
                    <div class="perk-description">${perk.description}</div>
                    <div class="perk-meta">
                      ${perk.value > 0 ? `<span class="perk-tag value">$${perk.value}</span>` : ''}
                      <span class="perk-tag frequency">${formatFrequency(perk.frequency)}</span>
                      ${perk.monthlyValue ? `<span class="perk-tag value">$${perk.monthlyValue}/mo</span>` : ''}
                    </div>
                  </div>
                  ${isTrackable && perk.frequency !== 'one-time' ? `
                    <button class="perk-calendar-btn" onclick="CardWise.downloadSinglePerk('${card.id}', '${perk.id}')" title="Add to calendar">
                      📅
                    </button>` : ''}
                </div>`;
            }).join('')}
          </div>
        </div>`;
    }).join('');
  }

  function formatFrequency(freq) {
    const map = {
      'annual': 'Annual',
      'monthly': 'Monthly',
      'quarterly': 'Quarterly',
      'ongoing': 'Ongoing',
      'one-time': 'One-time'
    };
    return map[freq] || freq;
  }

  // ==========================================
  //  Card Browser — Searchable Dropdown + Wallet Tags
  // ==========================================
  let browserFilter = 'all';
  let browserSearchQuery = '';
  let dropdownOpen = false;

  function getFilteredCards() {
    let cards = [...CARDS_DB];

    if (browserFilter === 'no-fee') {
      cards = cards.filter(c => c.annualFee === 0);
    } else if (browserFilter !== 'all') {
      cards = cards.filter(c => c.issuer === browserFilter);
    }

    if (browserSearchQuery) {
      const q = browserSearchQuery.toLowerCase();
      cards = cards.filter(c =>
        c.name.toLowerCase().includes(q) ||
        c.issuer.toLowerCase().includes(q) ||
        `${c.issuer} ${c.name}`.toLowerCase().includes(q)
      );
    }

    return cards;
  }

  function renderBrowserDropdown() {
    const dropdown = document.getElementById('cardSelectorDropdown');
    const cards = getFilteredCards();

    if (!dropdownOpen) {
      dropdown.classList.remove('open');
      return;
    }

    dropdown.classList.add('open');

    if (cards.length === 0) {
      dropdown.innerHTML = `<div class="dropdown-empty">No cards match your search.</div>`;
      return;
    }

    dropdown.innerHTML = cards.map(card => {
      const inWallet = isInWallet(card.id);
      return `
        <div class="dropdown-item">
          <div class="dropdown-item-swatch" style="background: ${card.gradient};"></div>
          <div class="dropdown-item-info">
            <div class="dropdown-item-name">${card.issuer} ${card.name}</div>
            <div class="dropdown-item-meta">${card.annualFee === 0 ? 'No annual fee' : '$' + card.annualFee + '/yr'} · ${card.network}</div>
          </div>
          ${inWallet ? '<span class="dropdown-item-check">✅</span>' : ''}
          <button class="dropdown-item-action ${inWallet ? 'remove-btn' : 'add-btn'}" 
                  onclick="CardWise.${inWallet ? 'removeFromWallet' : 'addToWallet'}('${card.id}')">
            ${inWallet ? 'Remove' : '+ Add'}
          </button>
        </div>`;
    }).join('');
  }

  function renderWalletTags() {
    const container = document.getElementById('walletTags');
    const walletCards = getWalletCards();

    if (walletCards.length === 0) {
      container.innerHTML = `<span class="wallet-tags-empty">No cards yet — search above to add some.</span>`;
      return;
    }

    container.innerHTML = walletCards.map(card => `
      <span class="wallet-tag">
        <span class="tag-swatch" style="background: ${card.gradient};"></span>
        ${card.issuer} ${card.name}
        <span class="tag-remove" onclick="CardWise.removeFromWallet('${card.id}')" title="Remove">✕</span>
      </span>
    `).join('');
  }

  function renderBrowser() {
    renderBrowserDropdown();
    renderWalletTags();
  }

  // ==========================================
  //  Calendar / .ics Export
  // ==========================================
  function generateICS(events) {
    let ics = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//CardWise//Perk Reminders//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'X-WR-CALNAME:CardWise Perk Reminders',
      'X-WR-TIMEZONE:America/New_York'
    ];

    events.forEach(evt => {
      const uid = `cardwise-${evt.id}-${evt.dateStr}@cardwise.app`;
      ics.push(
        'BEGIN:VEVENT',
        `UID:${uid}`,
        `DTSTART;VALUE=DATE:${evt.dateStr}`,
        `DTEND;VALUE=DATE:${evt.dateStr}`,
        `SUMMARY:${escapeICS(evt.title)}`,
        `DESCRIPTION:${escapeICS(evt.description)}`,
        evt.alarm ? `BEGIN:VALARM\nTRIGGER:-PT0M\nACTION:DISPLAY\nDESCRIPTION:${escapeICS(evt.title)}\nEND:VALARM` : '',
        'END:VEVENT'
      );
    });

    ics.push('END:VCALENDAR');
    return ics.filter(Boolean).join('\r\n');
  }

  function escapeICS(str) {
    return str.replace(/[\\;,\n]/g, (match) => {
      if (match === '\\') return '\\\\';
      if (match === ';') return '\\;';
      if (match === ',') return '\\,';
      if (match === '\n') return '\\n';
      return match;
    });
  }

  function getExpirationDate(perk, yearOffset = 0) {
    const now = new Date();
    const year = now.getFullYear() + yearOffset;

    if (perk.frequency === 'monthly') {
      const month = now.getMonth();
      const lastDay = new Date(year, month + 1, 0).getDate();
      return new Date(year, month, lastDay);
    }

    if (perk.frequency === 'quarterly') {
      const quarter = Math.floor(now.getMonth() / 3);
      return new Date(year, (quarter + 1) * 3, 0);
    }

    if (perk.frequency === 'annual') {
      if (perk.renewalMonth) {
        return new Date(year, perk.renewalMonth - 1 + 12, 0);
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

  function generateCalendarEvents() {
    const events = [];
    const walletCards = getWalletCards();
    const now = new Date();

    walletCards.forEach(card => {
      card.perks.forEach(perk => {
        if (perk.frequency === 'ongoing' || perk.frequency === 'one-time' || perk.value === 0) return;

        const expDate = getExpirationDate(perk);
        if (!expDate || expDate < now) return;

        const weekBefore = new Date(expDate);
        weekBefore.setDate(weekBefore.getDate() - 7);

        const title = `⚠️ Use ${card.issuer} ${card.name} ${perk.name}`;
        const desc = `${perk.name} worth $${perk.value} from your ${card.issuer} ${card.name} card. ${perk.description}`;

        if (weekBefore > now) {
          events.push({
            id: `${perk.id}-week`,
            title: `🔔 Reminder: ${title} (expires ${formatDateDisplay(expDate)})`,
            description: `Heads up! ${desc} expires in 1 week.`,
            dateStr: formatDateICS(weekBefore),
            date: weekBefore,
            alarm: true
          });
        }

        events.push({
          id: `${perk.id}-day`,
          title: `🚨 LAST DAY: ${title}`,
          description: `TODAY is the last day! ${desc}`,
          dateStr: formatDateICS(expDate),
          date: expDate,
          alarm: true
        });
      });
    });

    events.sort((a, b) => a.date - b.date);
    return events;
  }

  function downloadCalendar() {
    const events = generateCalendarEvents();
    if (events.length === 0) {
      showToast('📅', 'No calendar events to export. Add cards with trackable perks first!');
      return;
    }

    const icsContent = generateICS(events);
    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'cardwise-perk-reminders.ics';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showToast('📅', `Downloaded ${events.length} calendar events!`);
  }

  function downloadSinglePerk(cardId, perkId) {
    const card = CARDS_DB.find(c => c.id === cardId);
    const perk = card?.perks.find(p => p.id === perkId);
    if (!card || !perk) return;

    const events = [];
    const now = new Date();
    const expDate = getExpirationDate(perk);
    if (!expDate) return;

    const title = `⚠️ Use ${card.issuer} ${card.name} ${perk.name}`;
    const desc = `${perk.name} worth $${perk.value}. ${perk.description}`;

    const weekBefore = new Date(expDate);
    weekBefore.setDate(weekBefore.getDate() - 7);

    if (weekBefore > now) {
      events.push({
        id: `${perk.id}-week`,
        title: `🔔 Reminder: ${title} (expires ${formatDateDisplay(expDate)})`,
        description: `Heads up! ${desc}`,
        dateStr: formatDateICS(weekBefore),
        date: weekBefore,
        alarm: true
      });
    }

    events.push({
      id: `${perk.id}-day`,
      title: `🚨 LAST DAY: ${title}`,
      description: `TODAY is the last day! ${desc}`,
      dateStr: formatDateICS(expDate),
      date: expDate,
      alarm: true
    });

    const icsContent = generateICS(events);
    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cardwise-${perk.id}.ics`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showToast('📅', `Reminder added for ${perk.name}`);
  }

  function renderCalendarPreview() {
    const container = document.getElementById('calendarPreview');
    const events = generateCalendarEvents();

    if (events.length === 0) {
      container.innerHTML = `<p class="text-muted" style="margin-top: 24px;">Add cards with trackable perks to see calendar previews.</p>`;
      return;
    }

    const preview = events.slice(0, 6);
    container.innerHTML = `
      <p class="text-muted" style="margin-bottom: 16px; font-size: 0.85rem;">${events.length} total events will be exported</p>
      ${preview.map(evt => `
        <div class="calendar-event-preview">
          <span class="event-icon">${evt.id.includes('-week') ? '🔔' : '🚨'}</span>
          <div>
            <div class="event-title">${evt.title.substring(0, 60)}${evt.title.length > 60 ? '...' : ''}</div>
            <div class="event-date">${formatDateDisplay(evt.date)}</div>
          </div>
        </div>`).join('')}
      ${events.length > 6 ? `<p class="text-muted" style="margin-top: 12px; font-size: 0.82rem;">...and ${events.length - 6} more events</p>` : ''}
    `;
  }

  // ==========================================
  //  Navigation & Scroll
  // ==========================================
  function setupNavigation() {
    const links = document.querySelectorAll('.nav-links a');
    const sections = document.querySelectorAll('.section');

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          links.forEach(link => {
            link.classList.toggle('active', link.getAttribute('data-section') === id);
          });
        }
      });
    }, { threshold: 0.3, rootMargin: '-100px 0px -50% 0px' });

    sections.forEach(s => observer.observe(s));

    const fadeObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, { threshold: 0.1 });

    document.querySelectorAll('.fade-in').forEach(el => fadeObserver.observe(el));
  }

  // ==========================================
  //  Event Listeners
  // ==========================================
  function setupEventListeners() {
    // Optimizer search
    document.getElementById('optimizerSearch').addEventListener('input', (e) => {
      renderOptimizer(e.target.value);
    });

    // Advisor search
    document.getElementById('advisorSearchInput').addEventListener('input', (e) => {
      handleAdvisorSearch(e.target.value);
    });

    // Advisor category buttons
    document.getElementById('advisorCategories').addEventListener('click', (e) => {
      const btn = e.target.closest('.advisor-cat-btn');
      if (btn) {
        handleAdvisorCatClick(btn.dataset.catId);
      }
    });

    // Card selector input — show dropdown on focus/input
    const selectorInput = document.getElementById('cardSelectorInput');
    const selectorDropdown = document.getElementById('cardSelectorDropdown');

    selectorInput.addEventListener('focus', () => {
      dropdownOpen = true;
      renderBrowserDropdown();
    });

    selectorInput.addEventListener('input', (e) => {
      browserSearchQuery = e.target.value;
      dropdownOpen = true;
      renderBrowserDropdown();
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.card-selector-wrap')) {
        dropdownOpen = false;
        selectorDropdown.classList.remove('open');
      }
    });

    // Browser filter chips
    document.getElementById('browserFilters').addEventListener('click', (e) => {
      if (e.target.classList.contains('filter-btn')) {
        document.querySelectorAll('#browserFilters .filter-btn').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        browserFilter = e.target.dataset.filter;
        dropdownOpen = true;
        selectorInput.focus();
        renderBrowserDropdown();
      }
    });

    // Calendar download
    document.getElementById('downloadCalendarBtn').addEventListener('click', downloadCalendar);

    // Expand all
    document.getElementById('expandAllBtn').addEventListener('click', () => {
      const walletCards = getWalletCards();
      const allExpanded = walletCards.every(c => state.expanded[c.id]);
      walletCards.forEach(c => { state.expanded[c.id] = !allExpanded; });
      saveState();
      renderBenefits();
      document.getElementById('expandAllBtn').textContent = allExpanded ? 'Expand All' : 'Collapse All';
    });

    // Reset perks
    document.getElementById('resetPerksBtn').addEventListener('click', () => {
      if (confirm('Reset all perk tracking? This will uncheck all used perks.')) {
        resetAllPerks();
      }
    });
  }

  // ==========================================
  //  Render All
  // ==========================================
  function renderAll() {
    renderAdvisorCategories();
    renderAdvisorResult(activeAdvisorCat);
    renderDashboard();
    renderWallet();
    renderOptimizer();
    renderBenefits();
    renderBrowser();
    renderCalendarPreview();
  }

  // ==========================================
  //  Initialize
  // ==========================================
  function init() {
    loadState();
    renderAll();
    setupNavigation();
    setupEventListeners();
  }

  // Expose methods globally for inline handlers
  window.CardWise = {
    addToWallet,
    removeFromWallet,
    togglePerk,
    toggleExpand: (cardId) => {
      toggleExpand(cardId);
      const section = document.querySelector(`.benefit-card-section[data-card-id="${cardId}"]`);
      if (section) {
        section.classList.toggle('expanded');
      }
    },
    downloadSinglePerk,
    resetAllPerks
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
