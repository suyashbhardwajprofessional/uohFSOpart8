import { useState } from "react";
import Authors from "./components/Authors";
import Books from "./components/Books";
import NewBook from "./components/NewBook";
import UpdateForm from "./components/UpdateForm";
import LoginForm from "./components/LoginForm";
import { useApolloClient } from '@apollo/client'

const App = () => {
  const [page, setPage] = useState("authors");
  const [error, setError] = useState('')
  const [token, setToken] = useState(null)
  const [showRecommended, setShowRecommended] = useState(false)

  const client = useApolloClient()
  function triggerLogout() {
    setToken(null)
    localStorage.clear()
    client.resetStore()

    setPage("authors")
    console.log('triggered log out')
  }

  function triggerLogin() {
    setPage("loginpage")
    console.log('triggered log in')
  }

  return (
    <div>
      <div>
        <button onClick={() => setPage("authors")}>authors</button>
        <button onClick={() => {setShowRecommended(false); setPage("books")}}>books</button>
        {token && <button onClick={() => {setShowRecommended(true); setPage("books")} }>recommended</button>}
        {token && <button onClick={() => setPage("add")}>add book</button>}
        {token && <button onClick={() => setPage("update")}>update author</button>}
        <button onClick={() => token ? triggerLogout() : triggerLogin() }>{token?"LogOut":"LogIn"}</button>
      </div>

      <Authors show={page === "authors"} />

      <Books show={page === "books"} showRecommended={showRecommended}/>

      <NewBook show={page === "add"} />

      <UpdateForm show={page === "update"} />

      {!token && <LoginForm show={page === "loginpage"} setError={setError} setToken={setToken} /> }
    </div>
  );
}

export default App;
