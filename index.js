require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const Person = require('./models/people')

const app = express()
app.use(cors())
app.use(express.json())
app.use(express.static('build'))
morgan.token('body', (req, res) => JSON.stringify(req.body))
app.use(
  morgan(':method :url :status :res[content-length] - :response-time ms :body'),
)

const data = [
  {
    id: 1,
    name: 'Arto Hellas',
    number: '040-123456',
  },
  {
    id: 2,
    name: 'Ada Lovelace',
    number: '39-44-5323523',
  },
  {
    id: 3,
    name: 'Dan Abramov',
    number: '12-43-234345',
  },
  {
    id: 4,
    name: 'Mary Poppendieck',
    number: '39-23-6423122',
  },
]

app.get('/', (request, response) => {
  response.send('<h1>Hello World!</h1>')
})

app.get('/api/persons', (request, response) => {
  Person.find({}).then((people) => {
    response.json(people)
  })
})

app.get('/info', (request, response) => {
  Person.find({}).then((result) => {
    console.log('result:', result.length)
    response.send(
      `<p>Phonebook has info for ${result.length} ${
        result.length > 1 ? 'people' : 'person'
      }.</p>      
      <p>
      ${new Date().toString()}
      </p>`,
    )
  })
})

app.get('/api/persons/:id', (request, response, next) => {
  Person.findById(request.params.id)
    .then((result) => {
      if (result) {
        response.json(result)
      } else {
        response.status(404).send({ error: 'not found' })
      }
    })
    .catch((error) => next(error))
})

app.delete('/api/persons/:id', (request, response, next) => {
  Person.findByIdAndDelete(request.params.id)
    .then((result) => {
      response.status(204).end()
    })
    .catch((error) => next(error))
})
// const generateId = () => {
//   const min = 0;
//   const max = 10e10;
//   return Math.floor(Math.random() * (max - min + 1) + min);
// };

app.post('/api/persons', (request, response, next) => {
  const person = request.body
  if (!person.name || !person.number) {
    return response.status(400).json({
      error: 'Missing name or number',
    })
  }
  const newPerson = new Person({
    name: person.name,
    number: person.number,
  })
  newPerson.save().then((savedPerson) => {
    response.json(savedPerson)
  })
    .catch((error) => next(error))
})

app.put('/api/persons/:id', (request, response, next) => {
  const person = request.body
  const updatedPerson = {
    name: person.name,
    number: person.number,
  }

  Person.findByIdAndUpdate(request.params.id, updatedPerson, {
    new: true,
    runValidators: true,
    context: 'query',
  })
    .then((result) => {
      response.json(result)
    })
    .catch((error) => next(error))
})

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }
  next(error)
}

app.use(errorHandler)

const { PORT } = process.env
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
