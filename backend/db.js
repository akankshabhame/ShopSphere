
const fs = require('fs');
const path = require('path');
const FILE = process.env.DB_FILE || path.join(__dirname, 'data', 'db.json');

let data = { users: [], products: [], orders: [], counters: {} };
if (fs.existsSync(FILE)) data = JSON.parse(fs.readFileSync(FILE, 'utf8'));

const store = {
  get db() { return data; },
  save() {
    fs.mkdirSync(path.dirname(FILE), { recursive: true });
    fs.writeFileSync(FILE + '.tmp', JSON.stringify(data, null, 2));
    fs.renameSync(FILE + '.tmp', FILE);
  },
  nextId(name) { data.counters[name] = (data.counters[name] || 0) + 1; return data.counters[name]; },
  reset(d) { data = d; store.save(); },
};
module.exports = store;
