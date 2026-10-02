const sharp = require('sharp');
const fs = require('fs');

async function createHDLogo() {
  const symbolBuffer = await sharp('public/assets/brand/symbol-transparent-hd.png')
    .resize({ height: 110 })
    .png()
    .toBuffer();
  
  const symbolBase64 = symbolBuffer.toString('base64');
  const symbolMeta = await sharp(symbolBuffer).metadata();
  console.log('Resized symbol:', symbolMeta.width, symbolMeta.height);

  const totalWidth = 640;
  const totalHeight = 120;
  const symW = symbolMeta.width;
  const symH = symbolMeta.height;
  const symY = Math.round((totalHeight - symH) / 2);

  const svg = `
  <svg width="${totalWidth}" height="${totalHeight}" viewBox="0 0 ${totalWidth} ${totalHeight}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="textGradPro" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#ffffff"/>
        <stop offset="50%" stop-color="#f2f8fc"/>
        <stop offset="100%" stop-color="#dbe6f0"/>
      </linearGradient>
      <linearGradient id="textGradNicho" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#00f2fe"/>
        <stop offset="100%" stop-color="#24d5ff"/>
      </linearGradient>
      <filter id="neonGlow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="0" stdDeviation="5" flood-color="#00f2fe" flood-opacity="0.6"/>
      </filter>
      <filter id="textShadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="2" stdDeviation="4" flood-color="#000000" flood-opacity="0.4"/>
      </filter>
    </defs>
    <image href="data:image/png;base64,${symbolBase64}" x="0" y="${symY}" width="${symW}" height="${symH}" />
    
    <!-- Vertical divider needle -->
    <line x1="${symW + 20}" y1="28" x2="${symW + 20}" y2="92" stroke="#00e5f4" stroke-width="2.5" stroke-linecap="round" opacity="0.85" filter="url(#neonGlow)"/>
    <circle cx="${symW + 20}" cy="60" r="4" fill="#ffffff" filter="url(#neonGlow)"/>

    <!-- Typography -->
    <g filter="url(#textShadow)" font-family="system-ui, -apple-system, 'Segoe UI', Roboto, 'Sora', sans-serif">
      <text x="${symW + 38}" y="74" font-size="52" font-weight="800" fill="url(#textGradPro)" letter-spacing="-0.5px">Prospecta<tspan fill="url(#textGradNicho)">Nicho</tspan></text>
      <text x="${symW + 42}" y="98" font-size="13" font-weight="700" fill="#00e5f4" letter-spacing="3.2px" opacity="0.95">INTELIGÊNCIA B2B</text>
    </g>
  </svg>
  `;

  await sharp(Buffer.from(svg))
    .png()
    .trim()
    .toFile('public/assets/brand/logo-prospectanicho-hd-transparent.png');

  console.log('HD Transparent Logo created successfully!');
}

createHDLogo().catch(console.error);
