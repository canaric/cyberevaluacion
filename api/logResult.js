
module.exports = async (req, res) => {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }
  try {
    const { name, dni, score, status, date } = req.body || {};
    if (!name || !dni || typeof score === "undefined" || !status) {
      res.status(400).json({ error: "Missing fields" });
      return;
    }
    const owner = process.env.GH_REPO_OWNER;
    const repo = process.env.GH_REPO_NAME;
    const path = process.env.RESULTS_PATH || "data/resultados.csv";
    const token = process.env.GH_TOKEN;
    if (!owner || !repo || !token) {
      res.status(500).json({ error: "Missing environment variables" });
      return;
    }
    const apiBase = `https://api.github.com/repos/${owner}/${repo}/contents/${encodeURIComponent(path)}`;
    let existing = null; let sha = null; let csv = "";
    const getResp = await fetch(apiBase, {
      headers: { "Authorization": `Bearer ${token}`, "Accept": "application/vnd.github+json","User-Agent": "cyberevaluacion-logger" }
    });
    if (getResp.ok) {
      existing = await getResp.json(); sha = existing.sha;
      const content = Buffer.from(existing.content, "base64").toString("utf8"); csv = content;
    } else if (getResp.status === 404) { csv = "fecha_iso,nombre_apellido,dni,nota_porcentaje,estado\\n"; }
    else { const errTxt = await getResp.text(); res.status(502).json({ error: "GitHub GET failed", detail: errTxt }); return; }
    const safeName = ("" + name).replace(/\\r?\\n/g, " ").trim();
    const line = `${date || new Date().toISOString()},${safeName},${dni},${score},${status}\\n`; csv += line;
    const putBody = { message: `log: ${safeName} ${dni} ${status} ${score}%`, content: Buffer.from(csv, "utf8").toString("base64"), committer: { name: "cyberevaluacion-bot", email: "noreply@example.com" } };
    if (sha) putBody.sha = sha;
    const putResp = await fetch(apiBase, { method: "PUT", headers: { "Authorization": `Bearer ${token}`, "Accept": "application/vnd.github+json", "User-Agent": "cyberevaluacion-logger" }, body: JSON.stringify(putBody) });
    if (!putResp.ok) { const errTxt = await putResp.text(); res.status(502).json({ error: "GitHub PUT failed", detail: errTxt }); return; }
    res.status(200).json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: "Unexpected error", detail: String(err) });
  }
};
