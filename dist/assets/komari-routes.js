(() => {
  const carriers = [['telecom', '电信'], ['unicom', '联通'], ['mobile', '移动']];
  let data = {};
  function cell(record, carrier) {
    const meta = record?.carrier_meta?.[carrier];
    const value = record?.[carrier];
    if (!value) return [meta?.last_attempt_at ? '未识别' : '待检测', 'pending', meta?.last_attempt_at ? `最近探测未得到有效结果：${new Date(meta.last_attempt_at).toLocaleString('zh-CN')}` : '尚未探测'];
    const time = meta?.probed_at;
    const stale = !time || Date.now() - Date.parse(time) > 72 * 3600 * 1000;
    const status = stale ? '已过期' : meta?.status === 'failed' ? '最近探测失败' : meta?.status === 'held' ? '变化待确认' : '正常';
    const partial = meta?.destination_reached === false || meta?.path_incomplete === true;
    const quality = meta?.quality === 'excellent' || meta?.quality === 'good' || meta?.quality === 'standard'
      ? meta.quality
      : (/^(国内|CN2|9929|CMIN2)/i.test(value) ? 'excellent' : /(10099|CMI)/i.test(value) ? 'good' : 'standard');
    const tone = stale || meta?.status !== 'ok' || partial ? 'pending' : quality;
    const viaNote = meta?.via ? `（${meta.via}）` : '';
    return [value + (partial ? ' · 未完整' : ''), tone, `${status}${viaNote}；最近成功：${time ? new Date(time).toLocaleString('zh-CN') : '未知'}；${meta?.reason || ''}`];
  }
  function render() {
    for (const card of document.querySelectorAll('.server-card, .compact-node-card, .mini-node-card')) {
      const link = card.querySelector('a[href*="/instance/"]');
      const id = link?.getAttribute('href')?.split('/instance/')[1]?.split(/[?#]/)[0];
      if (!id) continue;
      let block = card.querySelector('.hv-route-summary');
      if (!block) {
        block = document.createElement('section');
        block.className = 'hv-route-summary';
        block.setAttribute('aria-label', 'IPv4 三网去程与回程');
        const target = card.querySelector('.compact-node-network, .server-card-footer, .mini-node-chip-row');
        if (target) target.before(block); else card.append(block);
      }
      const node = data[decodeURIComponent(id)] || {};
      const signature = JSON.stringify(node);
      if (block.dataset.signature === signature) continue;
      block.dataset.signature = signature;
      block.replaceChildren();
      const head = document.createElement('div');
      head.className = 'hv-route-head';
      const headLeft = document.createElement('span');
      headLeft.className = 'hv-route-head-left';
      const svgNS = 'http://www.w3.org/2000/svg';
      const headIcon = document.createElementNS(svgNS, 'svg');
      headIcon.setAttribute('viewBox', '0 0 24 24');
      headIcon.setAttribute('width', '13');
      headIcon.setAttribute('height', '13');
      headIcon.setAttribute('fill', 'none');
      headIcon.setAttribute('stroke', 'currentColor');
      headIcon.setAttribute('stroke-width', '2');
      headIcon.setAttribute('stroke-linecap', 'round');
      headIcon.setAttribute('stroke-linejoin', 'round');
      headIcon.setAttribute('aria-hidden', 'true');
      for (const d of ['M16 3l4 4-4 4', 'M20 7H4', 'M8 21l-4-4 4-4', 'M4 17h16']) {
        const path = document.createElementNS(svgNS, 'path');
        path.setAttribute('d', d);
        headIcon.append(path);
      }
      const headTitle = document.createElement('span');
      headTitle.textContent = '三网线路';
      headLeft.append(headIcon, headTitle);
      const headRight = document.createElement('span');
      headRight.className = 'hv-route-head-right';
      const headLegend = document.createElement('span');
      headLegend.className = 'hv-route-legend';
      headLegend.textContent = '↗ 去 · ↙ 回';
      const headBadge = document.createElement('span');
      headBadge.className = 'hv-route-badge';
      headBadge.textContent = 'IPv4';
      headRight.append(headLegend, headBadge);
      head.append(headLeft, headRight);
      block.append(head);
      for (const [carrier, label] of carriers) {
        const row = document.createElement('div'); row.className = 'hv-route-row';
        const title = document.createElement('span');
        title.className = `hv-route-carrier is-${carrier}`;
        const bar = document.createElement('i');
        const name = document.createElement('span');
        name.textContent = label;
        title.append(bar, name);
        row.append(title);
        for (const [direction, prefix] of [['forward', '↗'], ['return', '↙']]) {
          const [value, tone, detail] = cell(node[direction], carrier);
          const item = document.createElement('span');
          item.className = `hv-route-cell is-${tone}`;
          const dir = document.createElement('span');
          dir.className = 'hv-route-dir';
          dir.textContent = prefix;
          const val = document.createElement('span');
          val.className = 'hv-route-val';
          val.textContent = value;
          const dot = document.createElement('span');
          dot.className = 'hv-route-dot';
          item.append(dir, val, dot);
          item.title = `${direction === 'forward' ? '浙江第三方探测点 → VPS' : 'VPS → 浙江三网探测点'}；${detail}`;
          row.append(item);
        }
        block.append(row);
      }
    }
  }
  async function refresh() {
    try {
      const response = await fetch('/routes/api', { credentials: 'same-origin', cache: 'no-store' });
      data = response.ok ? await response.json() : {};
      render();
    } catch { data = {}; render(); }
  }
  let queued = false;
  new MutationObserver(() => { if (!queued) { queued = true; requestAnimationFrame(() => { queued = false; render(); }); } }).observe(document.documentElement, {childList: true, subtree: true});
  refresh();
  setInterval(refresh, 60000);
})();
