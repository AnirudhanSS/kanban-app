// src/utils/positionUtils.js
async function renormalizePositions(columnId, TransactionModel) {
  // fetch cards ordered, rewrite positions 1000,2000...
  const cards = await TransactionModel.findAll({ where: { column_id: columnId }, order: [['position','ASC']]});
  let pos = 1000;
  for (const c of cards) {
    await c.update({ position: pos });
    pos += 1000;
  }
}
module.exports = { renormalizePositions };
