import { useState } from 'react'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <main>
      <h1>SSS</h1>
      <p>React, Vite, and TypeScript are ready.</p>
      <button onClick={() => setCount((value) => value + 1)}>
        Count: {count}
      </button>
    </main>
  )
}

export default App
