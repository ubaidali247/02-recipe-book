const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = 3002;
const DB_PATH = path.join(__dirname, '..', 'data', 'db.json');

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'frontend')));

function readDB() {
  if (!fs.existsSync(DB_PATH)) {
    const initial = { recipes: [] };
    fs.writeFileSync(DB_PATH, JSON.stringify(initial, null, 2));
    return initial;
  }
  return JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
}

function writeDB(data) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

// Seed data if empty
function seedIfEmpty() {
  const db = readDB();
  if (db.recipes.length === 0) {
    db.recipes = [
    {
        "id": "seed-1",
        "title": "Spaghetti Carbonara",
        "description": "Sample description for Spaghetti Carbonara. This is test data for the flaky test detection research study.",
        "category": "Breakfast",
        "createdAt": "2026-07-21T00:21:18.538Z"
    },
    {
        "id": "seed-2",
        "title": "Chicken Tikka Masala",
        "description": "Sample description for Chicken Tikka Masala. This is test data for the flaky test detection research study.",
        "category": "Lunch",
        "createdAt": "2026-07-20T00:21:18.539Z"
    },
    {
        "id": "seed-3",
        "title": "Avocado Toast",
        "description": "Sample description for Avocado Toast. This is test data for the flaky test detection research study.",
        "category": "Dinner",
        "createdAt": "2026-07-19T00:21:18.539Z"
    },
    {
        "id": "seed-4",
        "title": "Chocolate Lava Cake",
        "description": "Sample description for Chocolate Lava Cake. This is test data for the flaky test detection research study.",
        "category": "Dessert",
        "createdAt": "2026-07-18T00:21:18.539Z"
    },
    {
        "id": "seed-5",
        "title": "Greek Salad",
        "description": "Sample description for Greek Salad. This is test data for the flaky test detection research study.",
        "category": "Snack",
        "createdAt": "2026-07-17T00:21:18.539Z"
    },
    {
        "id": "seed-6",
        "title": "Beef Stir Fry",
        "description": "Sample description for Beef Stir Fry. This is test data for the flaky test detection research study.",
        "category": "Breakfast",
        "createdAt": "2026-07-16T00:21:18.539Z"
    },
    {
        "id": "seed-7",
        "title": "Banana Bread",
        "description": "Sample description for Banana Bread. This is test data for the flaky test detection research study.",
        "category": "Lunch",
        "createdAt": "2026-07-15T00:21:18.539Z"
    },
    {
        "id": "seed-8",
        "title": "French Onion Soup",
        "description": "Sample description for French Onion Soup. This is test data for the flaky test detection research study.",
        "category": "Dinner",
        "createdAt": "2026-07-14T00:21:18.539Z"
    }
];
    writeDB(db);
  }
}
seedIfEmpty();

// GET all
app.get('/api/recipes', (req, res) => {
  const db = readDB();
  let items = db.recipes;
  if (req.query.search) {
    const q = req.query.search.toLowerCase();
    items = items.filter(i => i.title && i.title.toLowerCase().includes(q) || (i.name && i.name.toLowerCase().includes(q)));
  }
  if (req.query.category) {
    items = items.filter(i => i.category === req.query.category);
  }
  res.json(items);
});

// GET one
app.get('/api/recipes/:id', (req, res) => {
  const db = readDB();
  const item = db.recipes.find(i => i.id === req.params.id);
  if (!item) return res.status(404).json({ error: 'Not found' });
  res.json(item);
});

// POST create
app.post('/api/recipes', (req, res) => {
  const db = readDB();
  const item = { id: uuidv4(), ...req.body, createdAt: new Date().toISOString() };
  db.recipes.push(item);
  writeDB(db);
  res.status(201).json(item);
});

// PUT update
app.put('/api/recipes/:id', (req, res) => {
  const db = readDB();
  const idx = db.recipes.findIndex(i => i.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  db.recipes[idx] = { ...db.recipes[idx], ...req.body, updatedAt: new Date().toISOString() };
  writeDB(db);
  res.json(db.recipes[idx]);
});

// DELETE
app.delete('/api/recipes/:id', (req, res) => {
  const db = readDB();
  const idx = db.recipes.findIndex(i => i.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  db.recipes.splice(idx, 1);
  writeDB(db);
  res.json({ message: 'Deleted successfully' });
});

// Reset endpoint for testing
app.post('/api/reset', (req, res) => {
  const initial = { recipes: [] };
  writeDB(initial);
  seedIfEmpty();
  res.json({ message: 'Database reset' });
});

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok', project: 'Recipe Book' }));

// Serve frontend
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'frontend', 'index.html'));
});

app.listen(PORT, () => console.log('Recipe Book server running on http://localhost:3002'));
