const pool = require('../db');

const getAll = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM products');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

const create = async (req, res) => {
  const { name, price, description } = req.body;
  console.log(req.body);
  try {
    const result = await pool.query(
      'INSERT INTO products (name, price, description) VALUES ($1, $2, $3) RETURNING *',
      [name, price, description]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}

const getOneById = async (req, res) => {
}

const updateById = async (req, res) => {
}

const deleteById = async (req, res) => {
}

module.exports = {
  getAll,
  create,
  getOneById,
  updateById,
  deleteById
}


/*  APAGAR !!!

ideasRouter.route('/')
.get((req, res, next) => {
    res.send(db.getAllFromDatabase('ideas'))
})
.post(checkMillionDollarIdea, (req, res, next) => {
//    console.log(req.body);
    const newIdea = req.body;
    newIdea.numWeeks = Number(newIdea.numWeeks);
    newIdea.weeklyRevenue = Number(newIdea.weeklyRevenue);
//    console.log(newIdea);
    const idea = db.addToDatabase('ideas', newIdea);
    res.status(201).send(idea);
});

ideasRouter.route('/:ideaId')
.get((req, res, next) => {
    const idea = db.getFromDatabaseById('ideas', req.params.ideaId);
    if (idea) {
        res.send(idea);
    } else {
        res.status(404).send('Invalid Idea ID');
    }
})
.put((req, res, next) => {
    const updateIdea = req.body;
    updateIdea.numWeeks = Number(updateIdea.numWeeks);
    updateIdea.weeklyRevenue = Number(updateIdea.weeklyRevenue);
//    console.log(updateIdea);
    const idea = db.updateInstanceInDatabase('ideas', updateIdea);
    if (idea) {
        res.send(idea);
    } else {
        res.status(404).send('Invalid Idea ID');
    }
})
.delete((req, res, next) => {
    const idea = db.deleteFromDatabasebyId('ideas', req.params.ideaId);
    if (idea) {
        res.status(204).send();
    } else {
        res.status(404).send('Invalid Idea ID');
    }
});

*/