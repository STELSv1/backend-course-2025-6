const express = require('express');
const { program } = require('commander');
const http = require('http');
const path = require('path');
const fs = require('fs');
const multer = require('multer');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, options.cache)
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname)
    }
});
const upload = multer({ storage: storage });

app.post('/register', upload.single('photo'), (req, res) => {
    const { inventory_name, description } = req.body;

    if (!inventory_name) {
        return res.status(400).send('Inventory name is required'); 
    }

    const newItem = {
        id: Date.now().toString(), 
        name: inventory_name,      
        description: description || '', 
        photo: req.file ? req.file.filename : null 
    };

    inventory.push(newItem);
    res.status(201).send('Created');
});

app.post('/search', (req, res) => {
    const { id, has_photo } = req.body;
    const item = inventory.find(i => i.id === id);

    if (!item) {
        return res.status(404).send('Not Found'); 
    }

    let responseItem = { ...item };


    if (has_photo === 'on' && responseItem.photo) {
        responseItem.description += ` (Photo link: /inventory/${item.id}/photo)`;
    }

    res.status(200).json(responseItem);
});

app.get('/inventory/:id', (req, res) => {
    const item = inventory.find(i => i.id === req.params.id);
    if (!item) return res.status(404).send('Not Found');
    
    const response = { ...item, photoUrl: item.photo ? `/inventory/${item.id}/photo` : null };
    res.json(response);
});

app.get('/inventory/:id/photo', (req, res) => {
    const item = inventory.find(i => i.id === req.params.id);
    if (!item || !item.photo) return res.status(404).send('Not Found');

    res.setHeader('Content-Type', 'image/jpeg'); // [cite: 82]
    res.sendFile(path.join(path.resolve(options.cache), item.photo));
});


app.put('/inventory/:id', (req, res) => {
    const item = inventory.find(i => i.id === req.params.id);
    if (!item) return res.status(404).send('Not Found');

    if (req.body.name) item.name = req.body.name;
    if (req.body.description) item.description = req.body.description;

    res.json(item);
});


app.put('/inventory/:id/photo', upload.single('photo'), (req, res) => {
    const item = inventory.find(i => i.id === req.params.id);
    if (!item) return res.status(404).send('Not Found');
    
    if (req.file) {
        item.photo = req.file.filename;
        res.status(200).send('Photo updated');
    } else {
        res.status(400).send('No photo uploaded');
    }
});

app.delete('/inventory/:id', (req, res) => {
    const index = inventory.findIndex(i => i.id === req.params.id);
    if (index === -1) return res.status(404).send('Not Found');

    inventory.splice(index, 1);
    res.status(200).send('Deleted');
});
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true })); 

let inventory = [];

app.get('/RegisterForm.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'RegisterForm.html'));
});

app.get('/SearchForm.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'SearchForm.html'));
});

app.get('/inventory', (req, res) => {
    res.status(200).json(inventory);
});

program
  .requiredOption('-h, --host <host>', 'Server address')
  .requiredOption('-p, --port <port>', 'Server port')
  .requiredOption('-c, --cache <path>', 'Cache directory path');

program.parse(process.argv);
const options = program.opts();

if (!fs.existsSync(options.cache)) {
  fs.mkdirSync(options.cache, { recursive: true });
  console.log(`Created cache directory: ${options.cache}`);
}

const server = http.createServer(app);
server.listen(options.port, options.host, () => {
  console.log(`Server running at http://${options.host}:${options.port}`);
  console.log(`Cache directory: ${options.cache}`);
});