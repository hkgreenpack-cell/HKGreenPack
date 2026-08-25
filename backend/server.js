// server.js (執行於伺服器端，使用者看不到這段程式碼)
const express = require('express');
const cors = require('cors');
const app = express();

app.use(express.json());
app.use(cors()); // 允許前端跨域呼叫

// 核心計算 API 路由
app.post('/api/calculate', (req, res) => {
  const { mode, box, items } = req.body;

  let boxVol = box.l * box.w * box.h;
  let totalProdVol = 0;

  // 核心商業邏輯（受保護，不外洩）
  items.forEach(item => {
    totalProdVol += (item.l * item.w * item.h * item.qty);
  });

  if (boxVol <= 0 || totalProdVol <= 0) {
    return res.json({ error: "請輸入有效的尺寸數據" });
  }

  // 檢查體積溢出
  if (totalProdVol > boxVol) {
    const overflowPercent = ((totalProdVol / boxVol) * 100).toFixed(1);
    return res.json({
      status: 'overflow',
      message: `尺寸數據異常：內裝物總體積超過外盒容量 (${overflowPercent}%)`,
      boxVol,
      totalProdVol
    });
  }

  const voidVol = Math.max(0, boxVol - totalProdVol);
  const voidRatio = ((voidVol / boxVol) * 100).toFixed(1);
  
  // 二級包裝限值 50%
  const limit = 50; 
  const isPass = voidRatio <= limit;

  // 回傳計算結果給前端
  res.json({
    status: 'success',
    boxVol,
    totalProdVol,
    voidRatio,
    isPass,
    message: isPass ? `符合規定 (${voidRatio}% ≤ ${limit}%)` : `空隙率超標 (${voidRatio}% > ${limit}%)`
  });
});

// 啟動伺服器
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`PPWR 核心計算引擎已在 Port ${PORT} 安全運行`);
});
