import './style.css';

function getQueryParams() {
  const params = new URLSearchParams(window.location.search);
  return {
    address: params.get('address') || '',
    prob: params.get('prob') ? parseFloat(params.get('prob')) : null,
  };
}

function renderProbability(prob) {
  if (prob === null) return '';
  let isHigh = prob > 0.7;
  let label = isHigh ? '是' : '否';
  let color = isHigh ? '#e74c3c' : '#2ecc71';
  let riskText = isHigh ? '高风险' : '低风险';
  return `
    <div class="result-bar-section">
      <div class="prob-bar-bg">
        <div class="prob-bar" style="width:100%;background:${color}"></div>
      </div>
      <div class="result-highlight" style="color:${color}">${label} <span style="font-size:0.5em;vertical-align:middle;">(${riskText})</span></div>
      <div class="prob-label">是否为高风险概率</div>
    </div>
  `;
}

function renderPoolInfo(address) {
  return `
    <div class="pool-info">
      <div><b>地址：</b>${address}</div>
    </div>
  `;
}

function renderSummary(prob) {
  if (prob === null) return '';
  if (prob > 0.7) {
    return '<div class="result-summary">⚠️ 该钱包存在较高风险，请谨慎操作！</div>';
  } else if (prob > 0.4) {
    return '<div class="result-summary">该钱包存在一定风险，建议进一步核查项目信息。</div>';
  } else {
    return '<div class="result-summary">该钱包风险较低，但仍建议保持警惕。</div>';
  }
}

// 渲染特征相关性
function renderFeatureCorrelations(list) {
  if (!list || !list.length) return '';
  return `
    <div class="feature-corr-section">
      <h2>特征与高风险概率相关性</h2>
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

const { address, prob } = getQueryParams();
// 读取特征相关性
let featureCorrelations = [];
try {
  featureCorrelations = JSON.parse(localStorage.getItem('lastFeatureCorrelations') || '[]');
} catch {}

const app = document.getElementById('result-app');
app.className = 'result-app-center';

app.innerHTML = `
  <div class="container">
    <div class="result-page-title">分析结果</div>
    ${renderPoolInfo(address)}
    ${renderProbability(prob)}
    ${renderSummary(prob)}
    ${renderFeatureCorrelations(featureCorrelations)}
    <button class="result-back-btn" onclick="window.location.href='index.html'">返回</button>
  </div>
`;
