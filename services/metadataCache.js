const { db } = require("../db");
const {
  organizationListForMetaData,
  locationListForMetaData,
  productListForMetaData,
  productBatchListForMetaData,
} = require("./healthloq");
const logger = require("../logger");

// ── Read helpers ─────────────────────────────────────────────────────────────

const stmtCounts = db.prepare(
  "SELECT entity_type, COUNT(*) AS count FROM metadata_cache GROUP BY entity_type"
);
const stmtLastUpdated = db.prepare(
  "SELECT MAX(updated_at) AS last_updated FROM metadata_cache"
);

/**
 * Returns { counts: { organization, location, product, batch }, lastUpdated }
 */
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

/**
 * Fetches all organisations, then per-org locations + products, then
 * per-product batches.  Replaces the cache atomically per entity type.
 */
exports.refreshMetadataCache = async () => {
  if (_refreshing) return { skipped: true };
  _refreshing = true;

  try {
    logger.info("metadataCache: refresh started");

    // ── 1. Organisations ───────────────────────────────────────────────────
    const orgRes = await organizationListForMetaData({});
    const orgs   = Array.isArray(orgRes?.data) ? orgRes.data : [];

    db.transaction(() => {
      stmtDeleteByType.run("organization");
      for (const org of orgs) {
        if (org?.id != null && org?.name) {
          stmtUpsert.run("organization", String(org.id), org.name, null, null);
        }
      }
    })();

    // ── 2. Locations + Products (parallel per org) ─────────────────────────
    const locationMap = new Map();
    const productMap  = new Map();
    const batchMap    = new Map();

    await Promise.allSettled(
      orgs.map(async (org) => {
        if (org?.id == null) return;
        const orgId = String(org.id);

        const [locResult, prodResult] = await Promise.allSettled([
          locationListForMetaData({ organization_id: orgId }),
          productListForMetaData({ organization_id: orgId }),
        ]);

        // Locations
        if (locResult.status === "fulfilled") {
          for (const loc of locResult.value?.data ?? []) {
            if (loc?.id != null && loc?.name) {
              locationMap.set(String(loc.id), {
                id: String(loc.id), name: loc.name, orgId,
              });
            }
          }
        }

        // Products + per-product batches
        if (prodResult.status === "fulfilled") {
          const prods = prodResult.value?.data ?? [];
          for (const prod of prods) {
            if (prod?.id != null && prod?.name) {
              productMap.set(String(prod.id), {
                id: String(prod.id), name: prod.name, orgId,
              });
            }
          }

          await Promise.allSettled(
            prods
              .filter((p) => p?.id != null)
              .map(async (prod) => {
                const batchRes = await productBatchListForMetaData({
                  integrant_type_id: prod.id,
                  organization_id:   orgId,
                });
                for (const batch of batchRes?.data ?? []) {
                  if (batch?.id != null && batch?.name) {
                    batchMap.set(String(batch.id), {
                      id:        String(batch.id),
                      name:      batch.name,
                      orgId,
                      productId: String(prod.id),
                    });
                  }
                }
              })
          );
        }
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
