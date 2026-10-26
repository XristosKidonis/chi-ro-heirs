// Genera el logotipo de Chi-Ro Heirs en estilo Aura: CHI-RO HEIRS en Archivo condensada negrísima,
// fuera de foco, con borde de fotocopia y halo de grano. Sale en PNG transparente, en hueso y en tinta,
// apilado y horizontal: PNG grande para la marca (marca/png) y WebP liviano para la app (public/img).
// Uso: node herramientas/logotipo.mjs   (necesita Playwright)
import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const { chromium } = createRequire(process.env.PLAYWRIGHT_DIR || import.meta.url)('playwright');
const fuente = fs.readFileSync(`${RAIZ}/public/fuentes/archivo-latin-variable.woff2`).toString('base64');

// grande: fuera de foco con halo amplio (arranque, marca, instaladores).
// chico: para la barra y el menú; poco halo y grano fino dentro de la letra, dibujado ya a su tamaño
// para que la textura no se pierda al achicarlo.
const VARIANTES = {
  apilado: { lineas: ['CHI-RO', 'HEIRS'], ancho: 1400, foco: 0.09, halo: 0.32, haloA: 0.7, huecos: 0 },
  horizontal: { lineas: ['CHI-RO HEIRS'], ancho: 2400, foco: 0.09, halo: 0.32, haloA: 0.7, huecos: 0 },
  chico: { lineas: ['CHI-RO HEIRS'], ancho: 330, foco: 0.03, halo: 0.13, haloA: 0.32, huecos: 0.14, soloApp: true },
};
const TINTAS = { hueso: [241, 238, 232], tinta: [20, 20, 20] };

const b = await chromium.launch();
const p = await b.newPage();
await p.setContent('<html><body></body></html>');
for (const [nombre, v] of Object.entries(VARIANTES)) {
  for (const [tono, rgb] of Object.entries(TINTAS)) {
    const url = await p.evaluate(async ({ fuente, v, rgb }) => {
      const ff = new FontFace('Archivo Condensada', `url(data:font/woff2;base64,${fuente})`, { weight: '100 900', stretch: '62% 125%' });
      await ff.load();
      document.fonts.add(ff);
      const f = (t) => `900 condensed ${t}px "Archivo Condensada"`;
      const m = document.createElement('canvas').getContext('2d');
      // cada renglón llena el ancho
      const tams = v.lineas.map((l) => { m.font = f(100); return (v.ancho * 100) / m.measureText(l).width; });
      const lh = 0.86;
      const alto = tams.reduce((a, t) => a + t * lh, 0);
      const pad = Math.min(...tams) * 0.42;
      const W = Math.round(v.ancho + pad * 2);
      const H = Math.round(alto + pad * 2);
      const lienzo = (w, h) => Object.assign(document.createElement('canvas'), { width: w, height: h });
      const capa = lienzo(W, H);
      const c = capa.getContext('2d');
      c.fillStyle = '#fff';
      let y = pad;
      v.lineas.forEach((l, i) => {
        c.font = f(tams[i]);
        const w = c.measureText(l).width;
        c.fillText(l, (W - w) / 2, y + tams[i] * 0.79);
        y += tams[i] * lh;
      });
      const difuminar = (fuente, radio) => {
        let actual = fuente;
        let k = 1;
        while (k * 2 <= radio) {
          const n = lienzo(Math.max(1, actual.width / 2), Math.max(1, actual.height / 2));
          const g = n.getContext('2d');
          g.imageSmoothingQuality = 'high';
          g.drawImage(actual, 0, 0, n.width, n.height);
          actual = n;
          k *= 2;
        }
        const out = lienzo(W, H);
        const o = out.getContext('2d');
        o.imageSmoothingQuality = 'high';
        o.drawImage(actual, 0, 0, W, H);
        return o.getImageData(0, 0, W, H).data;
      };
      const tam = Math.min(...tams);
      const foco = difuminar(capa, Math.max(1, tam * v.foco));
      const halo = difuminar(capa, tam * v.halo);
      const out = lienzo(W, H);
      const o = out.getContext('2d');
      const img = o.createImageData(W, H);
      const d = img.data;
      for (let i = 0; i < d.length; i += 4) {
        const fo = foco[i + 3] / 255;
        const ha = halo[i + 3] / 255;
        if (fo < 0.01 && ha < 0.01) continue;
        let a = 0;
        if (fo > 0.5 + (Math.random() - 0.5) * 0.7) a = Math.random() < v.huecos ? 0.35 : 0.93 + Math.random() * 0.07;
        else if (Math.random() < Math.pow(ha, 1.3) * v.haloA) a = 0.45 + Math.random() * 0.45;
        if (!a) continue;
        d[i] = rgb[0]; d[i + 1] = rgb[1]; d[i + 2] = rgb[2];
        d[i + 3] = Math.round(a * 255);
      }
      o.putImageData(img, 0, 0);
      if (v.soloApp) return [null, out.toDataURL('image/webp', 0.9)];
      const chico = lienzo(Math.round(W * 0.42), Math.round(H * 0.42));
      const ch = chico.getContext('2d');
      ch.imageSmoothingQuality = 'high';
      ch.drawImage(out, 0, 0, chico.width, chico.height);
      return [out.toDataURL('image/png'), chico.toDataURL('image/webp', 0.82)];
    }, { fuente, v, rgb });
    const [png, webp] = url.map((u) => u && Buffer.from(u.split(',')[1], 'base64'));
    if (png) fs.writeFileSync(`${RAIZ}/marca/png/logotipo-${nombre}-${tono}.png`, png);
    fs.writeFileSync(`${RAIZ}/public/img/logotipo-${nombre}-${tono}.webp`, webp);
    console.log('listo', nombre, tono, png?.length, webp.length);
  }
}
await b.close();
