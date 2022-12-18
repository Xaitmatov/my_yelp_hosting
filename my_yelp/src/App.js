import React, { useEffect, useState } from 'react'
import { Amplify, API, graphqlOperation } from 'aws-amplify'
import { listTodos } from './graphql/queries'
import { createTodo } from './graphql/mutations'
import { withAuthenticator, Button, Heading } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import Container from 'react-bootstrap/Container';
import Navbar from 'react-bootstrap/Navbar';


import awsExports from "./aws-exports";
Amplify.configure(awsExports);

const initState = { name: '', description: '', location: '' }

const App = ({ signOut, user }) => {
  const [form, setForm] = useState(initState);
  const [items, setItems] = useState([]);

  useEffect(() => {
    fetchItems()
  }, [])

  function setInput(key, value) {
    setForm({ ...form, [key]: value })
  }

  async function fetchItems() {
    try {
      const res = await API.graphql(graphqlOperation(listTodos))
      const items = res.data.listTodos.items
      setItems(items)
    } catch (err) { console.log('error fetching todos') }
  }

  async function addItem() {
    try {
      if (!form.name || !form.description || !form.location) return
      const restaurant = { ...form }
      setForm(initState);
      setItems([...items, restaurant])
      await API.graphql(graphqlOperation(createTodo, {input: restaurant}))
    } catch (err) {
      console.log('error creating todo:', err)
    }
  }

  return (
      <>
        <Navbar expand="lg" variant="light" bg="light">
          <Container>
            <Navbar.Brand href="#">Restaurants</Navbar.Brand>
            <Heading level={4}> Welcome{user.username}</Heading>
            <Button variant="warning">Sign out</Button>{' '}
          </Container>
        </Navbar>

        <Container style={{ width: 600, margin: '0 auto', display: 'flex', flexDirection: 'column', justifyContent: 'right', padding: 20 }}>
          <input
              onChange={event => setInput('name', event.target.value)}
              style={styles.input}
              value={form.name}
              placeholder="Name"
          />
          <input
              onChange={event => setInput('description', event.target.value)}
              style={styles.input}
              value={form.description}
              placeholder="Description"
          />
          <input
              onChange={event => setInput('location', event.target.value)}
              style={styles.input}
              value={form.location}
              placeholder="location"
          />
          <button style={styles.button} onClick={addItem}>Create Restaurant</button>
          {
            items.map((todo, index) => (
                <div key={todo.id ? todo.id : index} style={styles.todo}>
                  <p style={styles.todoName}>{todo.name}</p>
                  <p style={styles.todoDescription}>{todo.description}</p>
                  <p style={styles.todoDescription}>{todo.location}</p>
                </div>
            ))
          }

        </Container>

      </>
  )
}

const styles = {
  todo: {  marginBottom: 15 },
  input: { border: 'none', backgroundColor: '#cbc6c6', marginBottom: 10, borderRadius: "12px", padding: 8, fontSize: 18 },
  todoName: { fontWeight: 'bold', fontSize: 20 },
  todoDescription: { marginBottom: 0 },
  button: { backgroundColor: "#11e011", color: 'black', outline: 'none', fontSize: 18, padding: '12px 0px', borderRadius: "12px" }
}

export default withAuthenticator(App);