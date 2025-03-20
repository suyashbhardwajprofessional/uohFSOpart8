import { useState } from "react";
import Authors from "./components/Authors";
import Books from "./components/Books";
import NewBook from "./components/NewBook";
import UpdateForm from "./components/UpdateForm";
import LoginForm from "./components/LoginForm";
import Notify from "./components/Notify";
import { useApolloClient } from '@apollo/client'
import { useQuery, useMutation, useSubscription } from '@apollo/client'
import { BOOK_ADDED, ALL_BOOKS } from "./components/queries";

// function that takes care of manipulating cache
export const updateCache = (cache, query, addedBook) => {
  // helper that is used to eliminate saving same book twice
  const uniqByTitle = (a) => {
    let seen = new Set()
    return a.filter((item) => {
      let k = item.title
      return seen.has(k) ? false : seen.add(k)
    })
  }

  cache.updateQuery(query, ({ allBooks }) => {
    return {
      allBooks: uniqByTitle(allBooks.concat(addedBook)),
    }
  })
}

const App = () => {
  const [page, setPage] = useState("authors");
  const [error, setError] = useState('')
  const [token, setToken] = useState(null)
  const [showRecommended, setShowRecommended] = useState(false)
  const [errorMessage, setErrorMessage] = useState(null)

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

  const notify = (message) => {
    setErrorMessage(message)
    setTimeout(() => {
      setErrorMessage(null)
    }, 10000)
  }

  useSubscription(BOOK_ADDED, {
    onData: ({ data, client }) => {
      const addedBook = data.data.bookAdded
      notify(`${addedBook.title} added`)
      updateCache(client.cache, { query: ALL_BOOKS }, addedBook)
      /*client.cache.updateQuery({ query: ALL_PERSONS }, ({ allPersons }) => {
        return {
          allPersons: allPersons.concat(addedBook),
        }
      })*/
    }
  })

  return (
    <div>
    <Notify errorMessage={errorMessage} />
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
