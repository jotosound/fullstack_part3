const express = require("express");
const app = express();
const morgan = require("morgan");
app.use(express.json());
morgan.token("body", function (req, res) {
  return JSON.stringify(req.body);
});
app.use(
  morgan(":method :url :status :res[content-length] - :response-time ms :body"),
);
let data = [
  {
    "id": 1,
    "name": "Arto Hellas",
    "number": "040-123456",
  },
  {
    "id": 2,
    "name": "Ada Lovelace",
    "number": "39-44-5323523",
  },
  {
    "id": 3,
    "name": "Dan Abramov",
    "number": "12-43-234345",
  },
  {
    "id": 4,
    "name": "Mary Poppendieck",
    "number": "39-23-6423122",
  },
];

app.get("/", (request, response) => {
  response.send("<h1>Hello World!</h1>");
});

app.get("/api/persons", (request, response) => {
  response.json(data);
});

app.get("/info", (request, response) => {
  response.send(
    `<p>Phonebook has info for ${data.length} ${
      data.length > 1 ? "people" : "person"
    }.</p>      
      <p>
      ${new Date().toString()}
      </p>`,
  );
});

app.get("/api/persons/:id", (request, response) => {
  const id = Number(request.params.id);
  const person = data.find((p) => p.id === id);
  if (person) {
    response.json(person);
  }
  response.status(404).end();
});

app.delete("/api/persons/:id", (request, response) => {
  const id = Number(request.params.id);
  data = data.filter((person) => person.id !== id);

  response.status(204).end();
});
const generateId = () => {
  const min = 0;
  const max = 10e10;
  return Math.floor(Math.random() * (max - min + 1) + min);
};

app.post("/api/persons", (request, response) => {
  const person = request.body;
  if (!person.name || !person.number) {
    return response.status(400).json({
      error: "Missing name or number",
    });
  }
  if (data.find((p) => p.name.toLowerCase() === person.name.toLowerCase())) {
    return response.status(400).json({
      error: "name must be unique",
    });
  }
  person.id = generateId();
  data = data.concat(person);

  response.json(person);
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
