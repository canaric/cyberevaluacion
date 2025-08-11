// cyberevaluacion/api/logResult.js
export default async function handler(req, res) {
  // CORS básico
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  try {
    const {
      GH_TOKEN,
      GH_REPO_OWNER,
      GH_REPO_NAME,
      RESULTS_PATH = 'cyberevaluacion/data/resultados.csv',
    } = process.env;

    if (!GH_TOKEN || !GH_REPO_OWNER || !GH_REPO_NAME) {
      return res.status(500).json({ ok: false, error: 'Missing GitHub env vars' });
    }

    // 1) Datos recibidos
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    const nombre = (body.nombre || body.name || '').toString().trim();
    const dni    = (body.dni || body.document || '').toString().trim();
    const nota   = (body.nota || body.score || body.porcentaje || '').toString().trim();
    const estado = (body.estado || body.status || '').toString().trim();

    const fechaIso = new Date().toISOString();
    const header   = 'fecha_iso,nombre_apellido,dni,nota_porcentaje,estado';
    const row      = `${fechaIso},${csvSafe(nombre)},${csvSafe(dni)},${csvSafe(nota)},${csvSafe(estado)}`;

    // 2) Leer si ya existe (para obtener contenido y SHA)
    const baseUrl = `https://api.github.com/repos/${GH_REPO_OWNER}/${GH_REPO_NAME}/contents/${RESULTS_PATH}`;
    const headersJson = {
      Authorization: `Bearer ${GH_TOKEN}`,
      'User-Agent': 'cyberevaluacion-bot',
      Accept: 'application/vnd.github+json',
    };

    let sha = null;
    let content = null;

    let get = await fetch(`${baseUrl}?ref=main`, { headers: headersJson });
    if (get.status === 200) {
      const json = await get.json();
      sha = json.sha || null;
      if (json.content && json.encoding === 'base64') {
        content = Buffer.from(json.content, 'base64').toString('utf8');
      } else {
        // fallback si no viene inline
        const raw = await fetch(json.download_url, { headers: { 'User-Agent': 'cyberevaluacion-bot' }});
        content = await raw.text();
      }
    } else if (get.status === 404) {
      // no existe aún → lo creamos con encabezado
      content = header + '\n';
    } else {
      const errTxt = await get.text();
      return res.status(get.status).json({ ok: false, error: `GET contents failed: ${errTxt}` });
    }

    // 3) Armar nuevo contenido y subir
    if (!content.startsWith(header)) content = header + '\n' + content.replace(/^\s+/, '');
    if (!content.endsWith('\n')) content += '\n';
    content += row + '\n';

    const putBody = {
      message: `Log examen ${nombre || dni} - ${fechaIso}`,
      content: Buffer.from(content, 'utf8').toString('base64'),
      branch: 'main',
      ...(sha ? { sha } : {}), // sha solo si actualizamos
    };

    const put = await fetch(baseUrl, {
      method: 'PUT',
      headers: { ...headersJson, 'Content-Type': 'application/json' },
      body: JSON.stringify(putBody),
    });

    if (!put.ok) {
      const txt = await put.text();
      return res.status(put.status).json({ ok: false, error: `PUT contents failed: ${txt}` });
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    return res.status(500).json({ ok: false, error: err.message });
  }
}

// Escapar comillas/comas para CSV sencillo
function csvSafe(s) {
  const t = String(s ?? '').replace(/"/g, '""');
  return /[",\n]/.test(t) ? `"${t}"` : t;
}
