const fs = require("fs");
const path = require("path");

const hokkaidoGeojsonPath = path.join(__dirname, "../public/N03-20250101_01.geojson");
const japanGeojsonPath = path.join(__dirname, "../public/japan.geojson");

console.log("Loading N03-20250101_01.geojson...");
const hokkaidoRaw = JSON.parse(fs.readFileSync(hokkaidoGeojsonPath, "utf-8"));

console.log("Loading japan.geojson...");
const japanRaw = JSON.parse(fs.readFileSync(japanGeojsonPath, "utf-8"));

const REGION_MAP = {
  // 道央
  "石狩振興局": "道央",
  "空知総合振興局": "道央",
  "後志総合振興局": "道央",
  "胆振総合振興局": "道央",
  "日高振興局": "道央",

  // 道南
  "渡島総合振興局": "道南",
  "檜山振興局": "道南",

  // 道北
  "上川総合振興局": "道北",
  "留萌振興局": "道北",
  "宗谷総合振興局": "道北",

  // 道東
  "オホーツク総合振興局": "道東",
  "十勝総合振興局": "道東",
  "釧路総合振興局": "道東",
  "根室振興局": "道東",
};

const REGION_NAMES_EN = {
  "道央": "Doo",
  "道南": "Donan",
  "道北": "Dohoku",
  "道東": "Doto",
};

const regionFeatures = {
  "道央": [],
  "道南": [],
  "道北": [],
  "道東": [],
};

for (const feat of hokkaidoRaw.features) {
  const bureau = feat.properties && feat.properties.N03_002;
  const region = REGION_MAP[bureau];
  if (region) {
    regionFeatures[region].push(feat);
  }
}

// Douglas-Peucker point-to-segment distance simplification
function simplifyRing(points, tolerance = 0.0008) {
  if (points.length <= 4) return points;

  function getSqDist(p1, p2) {
    const dx = p1[0] - p2[0];
    const dy = p1[1] - p2[1];
    return dx * dx + dy * dy;
  }

  function getSqSegDist(p, p1, p2) {
    let x = p1[0], y = p1[1];
    let dx = p2[0] - x, dy = p2[1] - y;

    if (dx !== 0 || dy !== 0) {
      const t = ((p[0] - x) * dx + (p[1] - y) * dy) / (dx * dx + dy * dy);
      if (t > 1) {
        x = p2[0];
        y = p2[1];
      } else if (t > 0) {
        x += dx * t;
        y += dy * t;
      }
    }
    dx = p[0] - x;
    dy = p[1] - y;
    return dx * dx + dy * dy;
  }

  const sqTol = tolerance * tolerance;

  function simplifyDPStep(pts, first, last, simplified) {
    let maxSqDist = sqTol;
    let index = -1;

    for (let i = first + 1; i < last; i++) {
      const sqDist = getSqSegDist(pts[i], pts[first], pts[last]);
      if (sqDist > maxSqDist) {
        index = i;
        maxSqDist = sqDist;
      }
    }

    if (maxSqDist > sqTol) {
      if (index - first > 1) simplifyDPStep(pts, first, index, simplified);
      simplified.push(pts[index]);
      if (last - index > 1) simplifyDPStep(pts, index, last, simplified);
    }
  }

  const simplified = [points[0]];
  simplifyDPStep(points, 0, points.length - 1, simplified);
  simplified.push(points[points.length - 1]);
  return simplified;
}

// Dissolve municipality internal boundaries for each region
function dissolveRegion(features) {
  const edgeMap = new Map();
  const PRECISION = 10000; // 4 decimal places (~10m) for fast robust edge matching
  const round = (val) => Math.round(val * PRECISION) / PRECISION;
  const ptKey = (pt) => `${round(pt[0])},${round(pt[1])}`;

  for (const feat of features) {
    const geom = feat.geometry;
    if (!geom) continue;

    const polygons =
      geom.type === "Polygon"
        ? [geom.coordinates]
        : geom.type === "MultiPolygon"
          ? geom.coordinates
          : [];

    for (const poly of polygons) {
      for (const ring of poly) {
        if (!ring || ring.length < 3) continue;
        for (let i = 0; i < ring.length - 1; i++) {
          const p1 = ring[i];
          const p2 = ring[i + 1];
          const k1 = ptKey(p1);
          const k2 = ptKey(p2);
          if (k1 === k2) continue;

          const forwardKey = `${k1}->${k2}`;
          const reverseKey = `${k2}->${k1}`;

          if (edgeMap.has(reverseKey)) {
            edgeMap.delete(reverseKey);
          } else {
            edgeMap.set(forwardKey, [p1, p2]);
          }
        }
      }
    }
  }

  console.log(`Remaining boundary edges: ${edgeMap.size}`);

  const adj = new Map();
  for (const [key, [p1, p2]] of edgeMap.entries()) {
    const k1 = ptKey(p1);
    if (!adj.has(k1)) adj.set(k1, []);
    adj.get(k1).push({ key, p1, p2 });
  }

  const rings = [];
  const visited = new Set();

  for (const [startEdgeKey, [startP1, startP2]] of edgeMap.entries()) {
    if (visited.has(startEdgeKey)) continue;

    const ring = [startP1];
    let currEdge = startEdgeKey;
    let currP2 = startP2;
    visited.add(currEdge);
    ring.push(currP2);

    let safety = 200000;
    while (safety-- > 0) {
      const k2 = ptKey(currP2);
      const startK1 = ptKey(startP1);

      if (k2 === startK1) {
        break;
      }

      const nextCandidates = adj.get(k2) || [];
      let nextEdge = null;
      for (const cand of nextCandidates) {
        if (!visited.has(cand.key)) {
          nextEdge = cand;
          break;
        }
      }

      if (!nextEdge) {
        break;
      }

      visited.add(nextEdge.key);
      currEdge = nextEdge.key;
      currP2 = nextEdge.p2;
      ring.push(currP2);
    }

    if (ring.length >= 4) {
      if (ptKey(ring[0]) !== ptKey(ring[ring.length - 1])) {
        ring.push(ring[0]);
      }
      const simplifiedRing = simplifyRing(ring, 0.001);
      if (simplifiedRing.length >= 4) {
        rings.push([simplifiedRing]);
      }
    }
  }

  return rings;
}

console.log("Dissolving Hokkaido regions...");
const newFeatures = Object.keys(regionFeatures).map((region, idx) => {
  console.log(`Processing ${region} (${regionFeatures[region].length} features)...`);
  const dissolvedCoordinates = dissolveRegion(regionFeatures[region]);
  console.log(`-> ${region} generated ${dissolvedCoordinates.length} outer polygon rings.`);

  return {
    type: "Feature",
    properties: {
      id: 101 + idx,
      nam: REGION_NAMES_EN[region],
      nam_ja: region,
    },
    geometry: {
      type: "MultiPolygon",
      coordinates: dissolvedCoordinates,
    },
  };
});

// Filter out old Hokkaido features from japan.geojson
const nonHokkaido = japanRaw.features.filter(
  (f) =>
    !(
      (f.properties &&
        (f.properties.nam_ja === "北海道" ||
          f.properties.nam_ja === "道北" ||
          f.properties.nam_ja === "道東" ||
          f.properties.nam_ja === "道央" ||
          f.properties.nam_ja === "道南" ||
          (f.properties.nam &&
            f.properties.nam.toLowerCase().includes("hokkaido")))) ||
      f.id === 1 ||
      f.properties?.id === 1
    )
);

console.log(`Preserved ${nonHokkaido.length} non-Hokkaido features.`);

const updatedJapanGeojson = {
  type: "FeatureCollection",
  features: [...nonHokkaido, ...newFeatures],
};

console.log(`Writing updated japan.geojson with total ${updatedJapanGeojson.features.length} features...`);
fs.writeFileSync(japanGeojsonPath, JSON.stringify(updatedJapanGeojson));
console.log("Successfully generated public/japan.geojson!");
