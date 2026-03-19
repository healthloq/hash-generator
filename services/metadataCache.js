const { db } = require("../db");
const {
  organizationListForMetaData,
  locationListForMetaData,
  productListForMetaData,
  productBatchListForMetaData,
} = require("./healthloq");
const logger = require("../logger");

// ── Response normalisation ────────────────────────────────────────────────────
//
// The four HealthLOQ service functions wrap their responses inconsistently:
//   - organizationListForMetaData returns response.data directly
//     → the raw API body, e.g. { status:"1", data:[...] }
//   - the others return { status:"1", data: response.data }
//     → response.data is the raw API body, which may be [...] or { data:[...] }
//
// safeArray() extracts the actual array from any of those shapes.
//
function safeArray(val) {
  if (Array.isArray(val))               return val;           // already an array
  if (val && Array.isArray(val.data))   return val.data;      // { data: [...] }
  return [];
}

// ── Read helpers ─────────────────────────────────────────────────────────────

const stmtCounts = db.prepare(
  "SELECT entity_type, COUNT(*) AS count FROM metadata_cache GROUP BY entity_type"
);
const stmtLastUpdated = db.prepare(
  "SELECT MAX(updated_at) AS last_updated FROM metadata_cache"
);

exports.getCacheSummary = () => {
  const rows = stmtCounts.all();
  const counts = { organization: 0, location: 0, product: 0, batch: 0 };
  for (const row of rows) {
    if (Object.prototype.hasOwnProperty.call(counts, row.entity_type)) {
      counts[row.entity_type] = row.count;
    }
  }
  const { last_updated } = stmtLastUpdated.get();
  return { counts, lastUpdated: last_updated || null };
};

const VALID_TYPES = new Set(["organization", "location", "product", "batch"]);

exports.getCacheEntries = (entityType) => {
  if (!VALID_TYPES.has(entityType)) throw new Error("Invalid entity type");

  if (entityType === "organization") {
    return db.prepare(
      `SELECT entity_id AS id, entity_name AS name
       FROM metadata_cache WHERE entity_type = 'organization'
       ORDER BY entity_name COLLATE NOCASE`
    ).all();
  }

  if (entityType === "location" || entityType === "product") {
    return db.prepare(
      `SELECT mc.entity_id AS id, mc.entity_name AS name,
              o.entity_name AS org_name
       FROM metadata_cache mc
       LEFT JOIN metadata_cache o
         ON o.entity_type = 'organization' AND o.entity_id = mc.org_id
       WHERE mc.entity_type = ?
       ORDER BY mc.entity_name COLLATE NOCASE`
    ).all(entityType);
  }

  return db.prepare(
    `SELECT mc.entity_id AS id, mc.entity_name AS name,
            o.entity_name AS org_name, p.entity_name AS product_name
     FROM metadata_cache mc
     LEFT JOIN metadata_cache o
       ON o.entity_type = 'organization' AND o.entity_id = mc.org_id
     LEFT JOIN metadata_cache p
       ON p.entity_type = 'product' AND p.entity_id = mc.product_id
     WHERE mc.entity_type = 'batch'
     ORDER BY mc.entity_name COLLATE NOCASE`
  ).all();
};

// ── Write helpers ────────────────────────────────────────────────────────────

const stmtUpsert = db.prepare(
  `INSERT OR REPLACE INTO metadata_cache
     (entity_type, entity_id, entity_name, org_id, product_id, updated_at)
   VALUES (?, ?, ?, ?, ?, datetime('now'))`
);
const stmtDeleteByType = db.prepare(
  "DELETE FROM metadata_cache WHERE entity_type = ?"
);

// ── Refresh ──────────────────────────────────────────────────────────────────

let _refreshing = false;
exports.isRefreshing = () => _refreshing;

exports.refreshMetadataCache = async () => {
  if (_refreshing) return { skipped: true };
  _refreshing = true;

  try {
    logger.info("metadataCache: refresh started");

    // ── 1. Organisations ───────────────────────────────────────────────────
    const orgRes = await organizationListForMetaData({});
    // organizationListForMetaData returns response.data directly (raw API body)
    const orgs = safeArray(orgRes);
    logger.info({ count: orgs.length }, "metadataCache: organisations fetched");

    db.transaction(() => {
      stmtDeleteByType.run("organization");
      for (const org of orgs) {
        if (org?.id != null && org?.name) {
          stmtUpsert.run("organization", String(org.id), org.name, null, null);
        }
      }
    })();

    // ── 2. Per-org: locations + products (parallel), then per-product batches
    const locationMap = new Map();
    const productMap  = new Map();
    const batchMap    = new Map();
    // Log the raw API shape once per entity type (not 35× per org)
    let _loggedLocShape  = false;
    let _loggedProdShape = false;

    await Promise.allSettled(
      orgs.map(async (org) => {
        if (org?.id == null) return;
        // Use the original id type — do NOT convert to string here so the
        // HealthLOQ API receives the same type it returned (typically a number).
        const orgId    = org.id;
        const orgIdStr = String(orgId);

        // Locations and products in parallel
        const [locResult, prodResult] = await Promise.allSettled([
          locationListForMetaData({ organization_id: orgId }),
          productListForMetaData({ organization_id: orgId }),
        ]);

        // ── Locations ──────────────────────────────────────────────────────
        if (locResult.status === "rejected") {
          logger.warn({ orgId, err: locResult.reason }, "metadataCache: location fetch failed");
        } else {
          // locationListForMetaData wraps: { status, data: <api_body> }
          // safeArray handles api_body being [...] or { data: [...] }
          const locs = safeArray(locResult.value?.data);
          if (locs.length === 0 && !_loggedLocShape) {
            _loggedLocShape = true;
            logger.warn({ orgId, raw: locResult.value }, "metadataCache: location API sample (zero usable records — check raw shape)");
          }
          for (const loc of locs) {
            if (loc?.id != null && loc?.name) {
              locationMap.set(String(loc.id), {
                id: String(loc.id), name: loc.name, orgId: orgIdStr,
              });
            }
          }
        }

        // ── Products ───────────────────────────────────────────────────────
        if (prodResult.status === "rejected") {
          logger.warn({ orgId, err: prodResult.reason }, "metadataCache: product fetch failed");
          return;
        }

        const prods = safeArray(prodResult.value?.data);
        if (prods.length === 0 && !_loggedProdShape) {
          _loggedProdShape = true;
          logger.warn({ orgId, raw: prodResult.value }, "metadataCache: product API sample (zero usable records — check raw shape)");
        }

        for (const prod of prods) {
          if (prod?.id != null && prod?.name) {
            productMap.set(String(prod.id), {
              id: String(prod.id), name: prod.name, orgId: orgIdStr,
            });
          }
        }

        // ── Batches (per product) ──────────────────────────────────────────
        await Promise.allSettled(
          prods
            .filter((p) => p?.id != null)
            .map(async (prod) => {
              const batchRes = await productBatchListForMetaData({
                integrant_type_id: prod.id,
                organization_id:   orgId,
              });
              // productBatchListForMetaData wraps: { status, data: <api_body> }
              const batches = safeArray(batchRes?.data);
              for (const batch of batches) {
                if (batch?.id != null && batch?.name) {
                  batchMap.set(String(batch.id), {
                    id:        String(batch.id),
                    name:      batch.name,
                    orgId:     orgIdStr,
                    productId: String(prod.id),
                  });
                }
              }
            })
        );
      })
    );

    // ── 3. Persist locations, products, batches ────────────────────────────
    db.transaction(() => {
      stmtDeleteByType.run("location");
      for (const loc of locationMap.values()) {
        stmtUpsert.run("location", loc.id, loc.name, loc.orgId, null);
      }
    })();

    db.transaction(() => {
      stmtDeleteByType.run("product");
      for (const prod of productMap.values()) {
        stmtUpsert.run("product", prod.id, prod.name, prod.orgId, null);
      }
    })();

    db.transaction(() => {
      stmtDeleteByType.run("batch");
      for (const batch of batchMap.values()) {
        stmtUpsert.run("batch", batch.id, batch.name, batch.orgId, batch.productId);
      }
    })();

    const summary = exports.getCacheSummary();
    logger.info({ counts: summary.counts }, "metadataCache: refresh complete");
    return summary;
  } catch (err) {
    logger.error({ err }, "metadataCache: refresh failed");
    throw err;
  } finally {
    _refreshing = false;
  }
};
