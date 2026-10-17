#!/usr/bin/env node
/**
 * NB Insider — Automated Google Sheet & Maintenance Agent
 *
 * Capabilities:
 *  a) Accepts a natural-language 1-sentence tip via `--tip "..."` or `NB_TIP` env var,
 *     geocodes the New Braunfels location via OpenStreetMap Nominatim (`New Braunfels, TX`),
 *     classifies Category / Corridor / Status, and outputs a CSV row for Google Sheets
 *     plus appends/updates `public/projects.json`.
 *  b) Audits `public/projects.json` for stale roadwork/alerts older than 14 days (`--check-stale`).
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECTS_PATH = path.resolve(__dirname, '../public/projects.json');

const STALE_THRESHOLD_DAYS = 14;

function parseArgs(argv) {
  const args = { tip: process.env.NB_TIP || '', checkStale: false, write: false };
  for (let i = 2; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--tip' && argv[i + 1]) {
      args.tip = argv[++i];
    } else if (arg.startsWith('--tip=')) {
      args.tip = arg.slice('--tip='.length);
    } else if (arg === '--check-stale') {
      args.checkStale = true;
    } else if (arg === '--write') {
      args.write = true;
    }
  }
  return args;
}

function classifyTip(tipText) {
  const lower = tipText.toLowerCase();

  let category = 'New Business';
  if (/(road|lane|closure|overpass|txdot|widening|turnaround|paving|traffic|wreck)/.test(lower)) {
    category = 'Roadwork';
  } else if (/(subdivision|homes|lots|apartments|precinct|elementary|veramendi|plat)/.test(lower)) {
    category = 'Subdivisions';
  } else if (/(rumor|rumored|hearing|maybe|speculation)/.test(lower)) {
    category = 'Rumored';
  }

  let corridor = 'Creekside / 306';
  if (/(gruene|hunter rd)/.test(lower)) {
    corridor = 'Gruene';
  } else if (/(46|veramendi|copper ridge|mission hill|loop 337)/.test(lower)) {
    corridor = 'Hwy 46 West';
  } else if (/(downtown|castell|san antonio st|coll st|plaza|landa)/.test(lower)) {
    corridor = 'Downtown';
  }

  const status =
    category === 'Roadwork'
      ? 'Active Construction'
      : category === 'Rumored'
      ? 'Reader Tip / Unconfirmed'
      : 'Site Work Spotted';

  return { category, corridor, status };
}

function extractLocationHint(tipText) {
  const match = tipText.match(/(?:at|near|on|along|by)\s+([^.,:;]+)/i);
  return match ? match[1].trim() : 'New Braunfels';
}

function latLngToSvg(lat, lng) {
  const x = Math.round(((lng - -98.21) / (-98.04 - -98.21)) * 360 + 20);
  const y = Math.round(((29.76 - lat) / (29.76 - 29.66)) * 280 + 20);
  return {
    svgX: Math.max(25, Math.min(375, x)),
    svgY: Math.max(25, Math.min(295, y)),
  };
}

async function geocodeNewBraunfels(queryLocation, corridor) {
  const searchStr = `${queryLocation}, New Braunfels, TX`;
  const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(
    searchStr
  )}`;

  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'NB-Insider-Maintenance-Agent/1.0 (New Braunfels Community Hub)',
      },
    });
    if (res.ok) {
      const results = await res.json();
      if (Array.isArray(results) && results.length > 0) {
        return {
          lat: parseFloat(results[0].lat),
          lng: parseFloat(results[0].lon),
          displayName: results[0].display_name,
        };
      }
    }
  } catch (err) {
    console.warn('Nominatim geocoding fallback triggered:', err.message);
  }

  // Corridor-aware New Braunfels intersection coordinates fallback
  const corridorFallbacks = {
    'Hwy 46 West': { lat: 29.7215, lng: -98.1618 },
    'Creekside / 306': { lat: 29.734, lng: -98.079 },
    Gruene: { lat: 29.738, lng: -98.106 },
    Downtown: { lat: 29.703, lng: -98.1245 },
  };
  const fallback = corridorFallbacks[corridor] || corridorFallbacks.Downtown;

  return {
    lat: fallback.lat,
    lng: fallback.lng,
    displayName: `${queryLocation}, New Braunfels, TX 78130`,
  };
}

function checkStaleProjects(projects) {
  const now = new Date();
  const staleItems = [];

  for (const proj of projects) {
    const updatedDate = proj.updatedAt ? new Date(proj.updatedAt) : null;
    if (!updatedDate || Number.isNaN(updatedDate.getTime())) continue;

    const ageDays = Math.floor((now - updatedDate) / (1000 * 60 * 60 * 24));
    if (ageDays > STALE_THRESHOLD_DAYS && (proj.category === 'Roadwork' || proj.category === 'Rumored')) {
      staleItems.push({ id: proj.id, title: proj.title, updatedAt: proj.updatedAt, ageDays });
    }
  }

  return staleItems;
}

async function main() {
  const args = parseArgs(process.argv);
  const projects = fs.existsSync(PROJECTS_PATH)
    ? JSON.parse(fs.readFileSync(PROJECTS_PATH, 'utf8'))
    : [];

  console.log('=== NB Insider Maintenance & Geocoding Agent ===');

  if (args.tip) {
    const locationHint = extractLocationHint(args.tip);
    const { category, corridor, status } = classifyTip(args.tip);
    const geo = await geocodeNewBraunfels(locationHint, corridor);
    const { svgX, svgY } = latLngToSvg(geo.lat, geo.lng);
    const today = new Date().toISOString().slice(0, 10);

    const newEntry = {
      id: `nb-${Date.now()}`,
      title: args.tip.length > 72 ? `${args.tip.slice(0, 69)}...` : args.tip,
      category,
      status,
      corridor,
      location: `${locationHint}, New Braunfels, TX`,
      estCompletion: 'TBD',
      updatedAt: today,
      lat: Number(geo.lat.toFixed(4)),
      lng: Number(geo.lng.toFixed(4)),
      svgX,
      svgY,
      summary: args.tip,
      fbUrl: 'https://www.facebook.com/groups/newbraunfels',
    };

    const csvRow = [
      newEntry.id,
      `"${newEntry.title.replace(/"/g, '""')}"`,
      newEntry.category,
      newEntry.status,
      newEntry.corridor,
      `"${newEntry.location.replace(/"/g, '""')}"`,
      newEntry.estCompletion,
      newEntry.updatedAt,
      newEntry.lat,
      newEntry.lng,
      newEntry.svgX,
      newEntry.svgY,
      `"${newEntry.summary.replace(/"/g, '""')}"`,
      newEntry.fbUrl,
    ].join(',');

    console.log('\n[1] Geocoded Structured Project JSON:');
    console.log(JSON.stringify(newEntry, null, 2));
    console.log('\n[2] Google Sheets CSV Row:');
    console.log(csvRow);

    if (args.write) {
      projects.unshift(newEntry);
      fs.writeFileSync(PROJECTS_PATH, `${JSON.stringify(projects, null, 2)}\n`, 'utf8');
      console.log(`\n[3] Appended project to ${PROJECTS_PATH}`);
    }
  }

  // Always run the 14-day staleness check so the map stays fresh
  const stale = checkStaleProjects(projects);
  console.log(`\n=== Staleness Check (> ${STALE_THRESHOLD_DAYS} days old) ===`);
  if (stale.length === 0) {
    console.log(`All ${projects.length} New Braunfels projects are fresh within ${STALE_THRESHOLD_DAYS} days.`);
  } else {
    console.log(`Found ${stale.length} stale project(s) needing verification:`);
    for (const item of stale) {
      console.log(` - [${item.id}] ${item.title} (Last updated: ${item.updatedAt}, ${item.ageDays} days ago)`);
    }
  }
}

main().catch((err) => {
  console.error('NB Maintenance Agent failed:', err);
  process.exit(1);
});
