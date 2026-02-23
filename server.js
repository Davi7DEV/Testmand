import express from "express";
import fetch from "node-fetch";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const PORT = 3000;

// Para servir o HTML e assets
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(__dirname));

// Cache simples em memória
let cache = null;
let cacheTime = 0;
const CACHE_DURATION = 15 * 60 * 1000; // 15 minutos

// Endpoint para fornecer dados de ondas
app.get("/ondas", async (req, res) => {
  const now = Date.now();
  if (cache && (now - cacheTime < CACHE_DURATION)) {
    return res.json(cache);
  }

  try {
    const surfSpots = [
      { name: "Barra do Jucu", lat: -20.400, lng: -40.300 },
      { name: "Praia Dule", lat: -20.330, lng: -40.320 },
      { name: "Praia da Costa", lat: -20.325, lng: -40.293 },
    ];

    const results = [];

    for (const spot of surfSpots) {
      const response = await fetch(
        `https://api.stormglass.io/v2/weather/point?lat=${spot.lat}&lng=${spot.lng}&params=waveHeight,waveDirection`,
        {
          headers: {
            "Authorization": "e42e13dc-105e-11f1-a997-0242ac120004-e42e1440-105e-11f1-a997-0242ac120004"
          }
        }
      );
      const data = await response.json();
      const altura = data.hours[0]?.waveHeight?.sg || 0;

      results.push({
        name: spot.name,
        lat: spot.lat,
        lng: spot.lng,
        waveHeight: altura
      });
    }

    cache = results;
    cacheTime = now;

    res.json(results);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Falha ao buscar ondas" });
  }
});

app.listen(PORT, () => console.log(`Servidor rodando em http://localhost:${PORT}`));