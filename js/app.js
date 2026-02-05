// CardWise — Main Application Logic
// Vanilla JS, localStorage persistence, .ics export

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
    wallet: [],        // array of card IDs in wallet
    perksUsed: {},     // { perkId: true/false }
    expanded: {}       // { cardId: true/false } for benefit sections
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
      showToast('✅', `Card added to wallet`);
    }
  }

  function removeFromWallet(cardId) {
    state.wallet = state.wallet.filter(id => id !== cardId);
    // Clean up perks for removed card
    const card = CARDS_DB.find(c => c.id === cardId);
    if (card) {
      card.perks.forEach(p => { delete state.perksUsed[p.id]; });
    }
    saveState();
    renderAll();
    showToast('🗑️', `Card removed from wallet`);
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
  //  Dashboard
  // ==========================================
  function renderDashboard() {
    const walletCards = getWalletCards();

    // Total fees
    const totalFees = walletCards.reduce((sum, c) => sum + c.annualFee, 0);
    document.getElementById('totalFees').textContent = `$${totalFees.toLocaleString()}`;
    document.getElementById('totalFeesDetail').textContent = `${walletCards.length} card${walletCards.length !== 1 ? 's' : ''} in wallet`;

    // Total perk value
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

    // Alerts
    renderAlerts(walletCards);
  }

  function renderAlerts(walletCards) {
    const container = document.getElementById('alertsContainer');
    const alerts = [];
    const now = new Date();
    const currentMonth = now.getMonth() + 1;

    walletCards.forEach(card => {
      card.perks.forEach(perk => {
        // Monthly perks reminder
        if (perk.frequency === 'monthly' && !state.perksUsed[perk.id]) {
          alerts.push({
            type: 'warning',
            icon: '⏰',
            text: `<span class="alert-card-name">${card.issuer} ${card.name}</span> — ${perk.name} resets monthly. Don't forget to use it!`
          });
        }
        // Annual perks near year end (Q4 reminder)
        if (perk.frequency === 'annual' && !state.perksUsed[perk.id] && perk.value > 50 && currentMonth >= 10) {
          alerts.push({
            type: 'danger',
            icon: '🔥',
            text: `<span class="alert-card-name">${card.issuer} ${card.name}</span> — ${perk.name} ($${perk.value}) expires at year end!`
          });
        }
        // Quarterly perks
        if (perk.frequency === 'quarterly' && !state.perksUsed[perk.id]) {
          alerts.push({
            type: 'warning',
            icon: '📋',
            text: `<span class="alert-card-name">${card.issuer} ${card.name}</span> — ${perk.name}. Make sure it's activated!`
          });
        }
      });

      // High-fee card with low usage
      const usedPerksCount = card.perks.filter(p => state.perksUsed[p.id] && p.frequency !== 'ongoing').length;
      const trackablePerks = card.perks.filter(p => p.frequency !== 'ongoing' && p.frequency !== 'one-time' && p.value > 0).length;
      if (card.annualFee >= 200 && trackablePerks > 0 && usedPerksCount === 0) {
        alerts.push({
          type: 'danger',
          icon: '💸',
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

    // Show max 5 alerts
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

      // Also check common merchant mappings
      const merchantMap = {
        'amazon': 'online_shopping',
        'target': 'online_shopping',
        'walmart': 'groceries',
        'costco': 'groceries',
        'trader joe': 'groceries',
        'whole foods': 'groceries',
        'uber eats': 'dining',
        'doordash': 'dining',
        'grubhub': 'dining',
        'chipotle': 'dining',
        'starbucks': 'dining',
        'mcdonald': 'dining',
        'netflix': 'streaming',
        'spotify': 'streaming',
        'hulu': 'streaming',
        'disney': 'streaming',
        'hbo': 'streaming',
        'delta': 'flights',
        'united': 'flights',
        'american airlines': 'flights',
        'southwest': 'flights',
        'hilton': 'hotels',
        'marriott': 'hotels',
        'hyatt': 'hotels',
        'airbnb': 'hotels',
        'shell': 'gas',
        'exxon': 'gas',
        'bp': 'gas',
        'chevron': 'gas',
        'lyft': 'transit',
        'uber': 'transit',
        'metro': 'transit',
        'subway': 'transit'
      };

      for (const [merchant, catId] of Object.entries(merchantMap)) {
        if (merchant.includes(query) || query.includes(merchant)) {
          const matchedCat = SPENDING_CATEGORIES.find(c => c.id === catId);
          if (matchedCat && !categories.find(c => c.id === matchedCat.id)) {
            categories.unshift(matchedCat);
          }
        }
      }

      if (categories.length === 0) {
        // Show general if no match
        categories = [SPENDING_CATEGORIES.find(c => c.id === 'general')];
      }
    }

    container.innerHTML = categories.map(cat => {
      // Find best card for this category
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
        <div class="optimizer-card accent-glow">
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
  //  Card Browser
  // ==========================================
  let browserFilter = 'all';
  let browserSearchQuery = '';

  function renderBrowser() {
    const container = document.getElementById('browserGrid');

    let cards = [...CARDS_DB];

    // Apply filter
    if (browserFilter === 'no-fee') {
      cards = cards.filter(c => c.annualFee === 0);
    } else if (browserFilter !== 'all') {
      cards = cards.filter(c => c.issuer === browserFilter);
    }

    // Apply search
    if (browserSearchQuery) {
      const q = browserSearchQuery.toLowerCase();
      cards = cards.filter(c =>
        c.name.toLowerCase().includes(q) ||
        c.issuer.toLowerCase().includes(q) ||
        `${c.issuer} ${c.name}`.toLowerCase().includes(q)
      );
    }

    if (cards.length === 0) {
      container.innerHTML = `<div style="grid-column: 1/-1; text-align: center; padding: 48px; color: var(--text-muted);">No cards match your search.</div>`;
      return;
    }

    container.innerHTML = cards.map(card => {
      const inWallet = isInWallet(card.id);
      // Get top earning rates for chips
      const topRates = card.earningRates.slice(0, 3);

      return `
        <div class="browser-card ${inWallet ? 'in-wallet' : ''}">
          <div class="browser-card-top">
            <div class="browser-card-swatch" style="background: ${card.gradient};"></div>
            <div>
              <div class="browser-card-title">${card.name}</div>
              <div class="browser-card-issuer">${card.issuer}</div>
              <div class="browser-card-fee">${card.annualFee === 0 ? 'No Annual Fee' : '$' + card.annualFee + '/year'}</div>
            </div>
          </div>
          <div class="browser-card-rates">
            ${topRates.map((r, i) => `
              <span class="rate-chip ${i === 0 ? 'highlight' : ''}">${r.rate}${r.unit} ${r.category}</span>
            `).join('')}
          </div>
          <button class="browser-card-action ${inWallet ? 'remove' : 'add'}" 
                  onclick="CardWise.${inWallet ? 'removeFromWallet' : 'addToWallet'}('${card.id}')">
            ${inWallet ? '✕ Remove from Wallet' : '+ Add to Wallet'}
          </button>
        </div>`;
    }).join('');
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
      // End of current month
      const month = now.getMonth();
      const lastDay = new Date(year, month + 1, 0).getDate();
      return new Date(year, month, lastDay);
    }

    if (perk.frequency === 'quarterly') {
      // End of current quarter
      const quarter = Math.floor(now.getMonth() / 3);
      const quarterEnd = new Date(year, (quarter + 1) * 3, 0);
      return quarterEnd;
    }

    if (perk.frequency === 'annual') {
      if (perk.renewalMonth) {
        return new Date(year, perk.renewalMonth - 1 + 12, 0); // End of year from renewal
      }
      return new Date(year, 11, 31); // Dec 31
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

        // Week before reminder
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

        // Day of
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

    // Sort by date
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

    // Show first 6 upcoming events
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

    // Intersection observer for active nav
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

    // Fade in on scroll
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

    // Browser search
    document.getElementById('browserSearch').addEventListener('input', (e) => {
      browserSearchQuery = e.target.value;
      renderBrowser();
    });

    // Browser filters
    document.getElementById('browserFilters').addEventListener('click', (e) => {
      if (e.target.classList.contains('filter-btn')) {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        browserFilter = e.target.dataset.filter;
        renderBrowser();
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
      // Re-render just the section
      const section = document.querySelector(`.benefit-card-section[data-card-id="${cardId}"]`);
      if (section) {
        section.classList.toggle('expanded');
      }
    },
    downloadSinglePerk,
    resetAllPerks
  };

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
