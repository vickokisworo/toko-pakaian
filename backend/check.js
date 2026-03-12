const pool = require('./config/db');

async function testUpdate() {
    const result = await pool.query(
        `UPDATE transactions SET jumlah_bayar = 1000 WHERE id = 1 RETURNING *`
    );
    console.log(result.rows);
    pool.end();
}
testUpdate().catch(console.error);
