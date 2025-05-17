import './style.css'

// 主UI渲染
const app = document.querySelector('#app');
app.innerHTML = `
  <div class="main-split-layout">
    <div class="main-analysis-section">
      <h1 class="main-title">去中心化钱包诈骗风险分析</h1>
      <form id="pool-form" class="form" style="max-width:600px;margin:0 auto 2em auto;width:96%;">
        <input type="text" id="pool-address" placeholder="钱包地址" autocomplete="off" style="font-size:1.18em;padding:1em 1.2em;" />
        <button type="submit" class="primary-btn" style="font-size:1.18em;padding:1em 0;">分析</button>
      </form>
      <div id="fetching-info" class="fetching-info"></div>
      <div id="result" class="result"></div>
      <div id="visualization" class="visualization"></div>
      <button id="history-btn" class="secondary-btn" style="margin-top:1.2em;">查询历史</button>
    </div>
  </div>
  <button id="intro-btn" class="intro-btn">功能说明</button>
  <div class="bg-geom"></div>
`;

// ====== 动态几何形状背景 ======
const geomShapes = [
  { type: 'circle', x: 120, y: 180 },
  { type: 'square', x: 420, y: 420 },
  { type: 'triangle', x: 900, y: 120 },
  { type: 'circle', x: 700, y: 320 },
  { type: 'square', x: 200, y: 520 },
  { type: 'triangle', x: 1050, y: 400 },
  { type: 'circle', x: 300, y: 80 },
  { type: 'square', x: 1000, y: 600 },
  { type: 'hex', x: 600, y: 100 },
  { type: 'star', x: 850, y: 500 },
];
const geomOrigin = [], geomElems = [];
const geomContainer = document.querySelector('.bg-geom');
if (geomContainer) {
  geomShapes.forEach((shape, i) => {
    const el = document.createElement('div');
    el.className = `bg-geom-shape bg-geom-${shape.type}`;
    el.style.left = shape.x + 'px';
    el.style.top = shape.y + 'px';
    geomContainer.appendChild(el);
    geomOrigin.push({ x: shape.x, y: shape.y });
    geomElems.push(el);
  });
}

function getContentRects() {
  const container = document.querySelector('.container');
  if (!container) return [];
  return [container.getBoundingClientRect()];
}
window.addEventListener('mousemove', (e) => {
  if (!geomElems.length) return;
  const mouse = { x: e.clientX, y: e.clientY };
  const contentRects = getContentRects();
  const isOnContent = contentRects.some(r =>
    mouse.x >= r.left && mouse.x <= r.right && mouse.y >= r.top && mouse.y <= r.bottom
  );
  geomElems.forEach((el, i) => {
    if (isOnContent) {
      el.classList.remove('active');
      el.style.left = geomOrigin[i].x + 'px';
      el.style.top = geomOrigin[i].y + 'px';
    } else {
      const dx = mouse.x - geomOrigin[i].x;
      const dy = mouse.y - geomOrigin[i].y;
      const dist = Math.sqrt(dx*dx + dy*dy);
      if (dist < 120) {
        const ratio = Math.max(0.2, 1 - dist/120);
        const tx = geomOrigin[i].x + dx * ratio * 0.7;
        const ty = geomOrigin[i].y + dy * ratio * 0.7;
        el.classList.add('active');
        el.style.left = tx + 'px';
        el.style.top = ty + 'px';
      } else {
        el.classList.remove('active');
        el.style.left = geomOrigin[i].x + 'px';
        el.style.top = geomOrigin[i].y + 'px';
      }
    }
  });
});

// AI概率预测（模拟或调用本地AI模型）
async function mockAIPredict(poolAddress, address) {
  // 若后续接入本地AI模型，可在此处替换为真实API调用
  // 示例：
  // const resp = await fetch('http://localhost:8000/predict', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({ address })
  // });
  // const data = await resp.json();
  // return data.probability;
  return new Promise((resolve) => {
    setTimeout(() => {
      const prob = poolAddress && poolAddress.includes('abc') ? 0.85 : 0.23 + Math.random() * 0.5;
      resolve(Math.min(1, Math.max(0, prob)));
    }, 800);
  });
}

// 概率可视化
function renderProbability(prob) {
  const percent = (prob * 100).toFixed(1);
  let color = prob > 0.7 ? '#e74c3c' : prob > 0.4 ? '#f1c40f' : '#2ecc71';
  return `
    <div class="prob-bar-bg">
      <div class="prob-bar" style="width:${percent}%;background:${color}"></div>
    </div>
    <div class="prob-label">高风险概率：<b>${percent}%</b></div>
  `;
}

// 模拟链上查询（预留真实链上API接口）
async function fetchPoolInfo({ address }) {
  // 若后续接入真实链上API，可在此处替换为真实API调用
  // 示例：
  // const resp = await fetch(`https://api.etherscan.io/v2/api?chainid=1&module=account&action=balance&address=${address}&tag=latest&apikey=YourApiKeyToken`);
  // const data = await resp.json();
  // if (data.status === '1') return { address, balance: data.result };
  // else throw new Error(data.message || '查询失败');
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (address) {
        resolve({ address });
      } else {
        reject('请输入钱包地址');
      }
    }, 600);
  });
}

// 生成特征相关性数据（支持本地模型API获取）
async function generateFeatureCorrelations(address) {
  let isMock = false;
  try {
    const resp = await fetch('http://localhost:8000/feature-correlation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ address })
    });
    if (resp.ok) {
      const data = await resp.json();
      if (Array.isArray(data.features)) {
        return { features: data.features.sort((a, b) => Math.abs(b.correlation) - Math.abs(a.correlation)), isMock: false };
      }
    }
    // 若返回异常则降级为模拟数据
    isMock = true;
  } catch (e) {
    isMock = true;
  }
  const features = [
    { name: '交易金额', correlation: 0.82 },
    { name: 'Gas价格', correlation: -0.65 },
    { name: '钱包年龄', correlation: -0.55 },
    { name: '交易数量', correlation: 0.73 },
    { name: '流动性移除量', correlation: -0.41 },
    { name: '重复代币授权次数', correlation: -0.33 },
    { name: '合约复杂度', correlation: -0.25 },
    { name: '发送至交易所的代币数量', correlation: -0.15 },
    { name: '提现与存款比率', correlation: 0.12 },
    { name: '突发交易模式', correlation: 0.09 },
    { name: '唯一钱包交互数', correlation: 0.08 },
    { name: '最大交易金额', correlation: 0.07 },
    { name: '交易失败率', correlation: -0.06 },
    { name: '钱包信誉评分', correlation: 0.05 },
    { name: '资金转移百分比', correlation: 0.04 },
    { name: '代币持有量', correlation: 0.03 },
    { name: '部署者信誉', correlation: 0.02 },
    { name: '多次代币授权', correlation: -0.01 },
    { name: '交易间隔时间', correlation: 0.01 },
    { name: '平均小额交易规模', correlation: -0.02 },
    { name: '小额交易总量', correlation: 0.03 },
    { name: '小额交易占比', correlation: 0.04 },
    { name: '平均交易间隔', correlation: -0.03 },
    { name: '最大连续小额交易次数', correlation: 0.02 },
    { name: '累计交易量', correlation: 0.01 },
    { name: '交易波动性', correlation: -0.01 },
    { name: '异常Gas费比率', correlation: 0.01 },
    { name: 'ERC20与ERC721代币比率', correlation: -0.01 },
    { name: '失败交易次数', correlation: 0.01 },
    { name: '诈骗前不活跃期', correlation: -0.01 },
    { name: '昼夜活动分布', correlation: 0.01 },
    { name: 'NFT转账次数', correlation: 0.01 },
    { name: '可疑合约调用', correlation: 0.01 },
    { name: '铸造与转账比率', correlation: -0.01 },
    { name: 'DEX交互比率', correlation: 0.01 },
    { name: '社交媒体提及次数', correlation: 0.01 },
    { name: '钱包ID', correlation: 0.01 }
  ];
  return { features: features.sort((a, b) => Math.abs(b.correlation) - Math.abs(a.correlation)), isMock: true };
}

// 特征相关性可视化
function renderFeatureCorrelations(list) {
  return `
    <div class="feature-corr-section">
      <h2>特征与是否高诈骗风险相关性</h2>
      <ul class="feature-corr-list">
        ${list.map(f => `
          <li>
            <span class="feature-name">${f.name}</span>
            <span class="feature-corr-value" style="color:${f.correlation > 0 ? '#2563eb' : '#e67e22'};">
              ${f.correlation > 0 ? '正相关' : '负相关'}
              <span class="corr-num">(${(f.correlation * 100).toFixed(0)}%)</span>
            </span>
          </li>
        `).join('')}
      </ul>
    </div>
  `;
}

// 分析中动画
function animateResultText() {
  const el = document.getElementById('result');
  if (!el) return;
  let i = 0;
  const colors = ['#f1c40f', '#646cff', '#e67e22'];
  el._interval = setInterval(() => {
    el.style.color = colors[i % colors.length];
    i++;
  }, 350);
}
function stopAnimateResultText() {
  const el = document.getElementById('result');
  if (el && el._interval) {
    clearInterval(el._interval);
    el._interval = null;
    el.style.color = '';
  }
}

// 事件绑定
const form = document.getElementById('pool-form');
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  let address = document.getElementById('pool-address').value.trim();
  if (!address) {
    alert('请输入钱包地址');
    return;
  }
  document.getElementById('fetching-info').textContent = '正在链上查询信息...';
  try {
    const info = await fetchPoolInfo({ address });
    address = info.address;
    document.getElementById('fetching-info').textContent = '';
    document.getElementById('result').innerHTML = '分析中...';
    animateResultText();
    document.getElementById('visualization').innerHTML = `<div class="pool-info"><div><b>地址：</b>${address}</div></div>`;
    const prob = await mockAIPredict('', address);
    stopAnimateResultText();
    const { features: featureCorrelations, isMock } = await generateFeatureCorrelations(address);
    if (isMock) {
      document.getElementById('visualization').innerHTML += `<div style="color:#e67e22;font-size:1.08em;margin:0.5em 0 0.2em 0;">（本地模型暂不可用，模拟结果）</div>`;
    }
    // 保存查询历史（最多20条，最新在前）
    const history = JSON.parse(localStorage.getItem('queryHistory') || '[]');
    history.unshift({
      address,
      prob,
      time: Date.now(),
      featureCorrelations,
      isMock
    });
    localStorage.setItem('queryHistory', JSON.stringify(history.slice(0, 20)));
    // 跳转到新页面并传递数据
    const params = new URLSearchParams({ address, prob });
    window.localStorage.setItem('lastFeatureCorrelations', JSON.stringify(featureCorrelations));
    window.localStorage.setItem('lastIsMock', isMock ? '1' : '0');
    window.location.href = `result.html?${params.toString()}`;
  } catch (err) {
    stopAnimateResultText();
    document.getElementById('fetching-info').textContent = err;
  }
});

// 查询历史按钮点击后显示历史弹窗
const historyBtn = document.getElementById('history-btn');
if (historyBtn) {
  historyBtn.addEventListener('click', () => {
    // 若已存在弹窗则不重复创建
    if (document.getElementById('history-modal')) return;
    const modal = document.createElement('div');
    modal.id = 'history-modal';
    modal.style.position = 'fixed';
    modal.style.left = '0';
    modal.style.top = '0';
    modal.style.width = '100vw';
    modal.style.height = '100vh';
    modal.style.background = 'rgba(30,40,60,0.18)';
    modal.style.zIndex = '1000';
    modal.style.display = 'flex';
    modal.style.alignItems = 'center';
    modal.style.justifyContent = 'center';
    modal.innerHTML = `
      <div class="history-modal-content" style="background:#fff;border-radius:18px;box-shadow:0 8px 40px #2563eb33;padding:2.2em 1.2em 1.2em 1.2em;min-width:320px;max-width:98vw;width:420px;max-height:80vh;overflow:auto;position:relative;">
        <button id="close-history-modal" style="position:absolute;right:1.2em;top:1.2em;font-size:1.3em;background:none;border:none;color:#2563eb;cursor:pointer;">×</button>
        <h2 style="margin-top:0;color:#2563eb;font-size:1.3em;text-align:center;">历史记录</h2>
        <div id="history-list"></div>
      </div>
    `;
    document.body.appendChild(modal);
    // 渲染历史内容
    const history = JSON.parse(localStorage.getItem('queryHistory') || '[]');
    const listDiv = document.getElementById('history-list');
    if (!history.length) {
      listDiv.innerHTML = '<div style="color:#b6b8c9;font-size:1.15em;text-align:center;margin:2em 0;">暂无历史</div>';
    } else {
      listDiv.innerHTML = `
        <div style="display:flex;justify-content:flex-end;margin-bottom:0.7em;">
          <button id="clear-history-btn" style="padding:0.4em 1.2em;font-size:1em;border-radius:6px;background:#e74c3c;color:#fff;border:none;cursor:pointer;">清空历史</button>
        </div>
        <table style="width:100%;border-collapse:collapse;font-size:1em;">
          <thead><tr style="color:#2563eb;background:#e3eaff;"><th style="padding:0.4em;">时间</th><th>地址</th><th>是否高风险</th><th>是否为本地模型</th></tr></thead>
          <tbody>
            ${history.map(item => `
              <tr style="border-bottom:1px solid #e3eaff;cursor:pointer;" data-address="${item.address}" data-prob="${item.prob}">
                <td style="padding:0.4em;">${new Date(item.time).toLocaleString()}</td>
                <td style="font-size:0.95em;">${item.address || '-'}</td>
                <td style="color:${item.prob > 0.7 ? '#e74c3c' : '#2ecc71'};font-weight:bold;">${item.prob > 0.7 ? '是' : '否'}</td>
                <td style="color:#888;">${item.isMock ? '是' : '否'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        <div style="font-size:0.95em;color:#888;margin-top:0.5em;text-align:center;">点击记录可跳转查看详细分析</div>
      `;
      // 绑定清空历史按钮事件
      setTimeout(() => {
        const clearBtn = document.getElementById('clear-history-btn');
        if (clearBtn) {
          clearBtn.onclick = () => {
            if (confirm('确定要清空所有查询历史吗？')) {
              localStorage.removeItem('queryHistory');
              listDiv.innerHTML = '<div style="color:#b6b8c9;font-size:1.15em;text-align:center;margin:2em 0;">暂无历史</div>';
            }
          };
        }
      }, 0);
    }
    // 关闭弹窗
    document.getElementById('close-history-modal').onclick = () => {
      modal.remove();
    };
    // 点击历史记录跳转
    listDiv.onclick = (e) => {
      const tr = e.target.closest('tr[data-address]');
      if (tr) {
        const address = tr.getAttribute('data-address');
        const prob = tr.getAttribute('data-prob');
        // 查找特征相关性
        const history = JSON.parse(localStorage.getItem('queryHistory') || '[]');
        const item = history.find(h => h.address === address && String(h.prob) === prob);
        if (item) {
          window.localStorage.setItem('lastFeatureCorrelations', JSON.stringify(item.featureCorrelations || []));
        }
        const params = new URLSearchParams({ address, prob });
        window.location.href = `result.html?${params.toString()}`;
      }
    };
  });
}

// 功能说明弹窗
const introBtn = document.getElementById('intro-btn');
if (introBtn) {
  introBtn.addEventListener('click', () => {
    if (document.getElementById('intro-modal')) return;
    const modal = document.createElement('div');
    modal.id = 'intro-modal';
    modal.style.position = 'fixed';
    modal.style.left = '0';
    modal.style.top = '0';
    modal.style.width = '100vw';
    modal.style.height = '100vh';
    modal.style.background = 'rgba(30,40,60,0.18)';
    modal.style.zIndex = '1001';
    modal.style.display = 'flex';
    modal.style.alignItems = 'center';
    modal.style.justifyContent = 'center';
    modal.innerHTML = `
      <div style="background:#fff;border-radius:18px;box-shadow:0 8px 40px #2563eb33;padding:2.2em 1.2em 1.2em 1.2em;min-width:320px;max-width:98vw;width:420px;max-height:80vh;overflow:auto;position:relative;">
        <button id="close-intro-modal" style="position:absolute;right:1.2em;top:1.2em;font-size:1.3em;background:none;border:none;color:#2563eb;cursor:pointer;">×</button>
        <h2 style="margin-top:0;color:#2563eb;font-size:1.3em;text-align:center;">功能说明</h2>
        <div style="font-size:1.08em;line-height:1.8;color:#1a2340;padding:0.5em 0.2em;">
          <ul style="padding-left:1.2em;">
            <li>输入钱包地址地址，点击“分析”可获得AI模型对该钱包是否高诈骗风险概率的判断。</li>
            <li>分析结果以进度条和高/低诈骗风险标签直观展示。</li>
            <li>展示与高诈骗风险概率相关性最强的特征，辅助理解风险来源。</li>
            <li>点击“查询历史”可查看最近20次分析记录，并可一键跳转分析详情。</li>
            <li>所有操作均在本地完成，数据不会上传服务器，保障隐私安全。</li>
          </ul>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
    document.getElementById('close-intro-modal').onclick = () => modal.remove();
  });
}
