// cyberevaluacion/api/downloadResults.js
export default async function handler(req, res) {
  try {
    if (req.method !== 'GET') {
      return res.status(405).json({ ok: false, error: 'Method not allowed' });
    }

    const { pass } = req.query;
    const PASSWORD = process.env.RESULTS_PASSWORD || 'LadoOscuroSI';
    if (pass !== PASSWORD) return res.status(401).json({ ok: false, error: 'Unauthorized' });

    const {
      GH_TOKEN,
      GH_REPO_OWNER,
      GH_REPO_NAME,
      RESULTS_PATH = 'cyberevaluacion/data/resultados.csv',
    } = process.env;

    const url = `https://api.github.com/repos/${GH_REPO_OWNER}/${GH_REPO_NAME}/contents/${RESULTS_PATH}?ref=main`;

    const gh = await fetch(url, {
      headers: {
        Authorization: `Bearer ${GH_TOKEN}`,
        'User-Agent': 'cyberevaluacion-download',
        Accept: 'application/vnd.github.raw',
      },
    });

    if (!gh.ok) {
      const text = await gh.text();
      return res.status(gh.status).json({ ok: false, error: text });
    }

    const csv = await gh.text();
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="resultados.csv"');
    res.setHeader('Cache-Control', 'no-store');
    return res.status(200).send(csv);
  } catch (err) {
    return res.status(500).json({ ok: false, error: err.message });
  }
}
