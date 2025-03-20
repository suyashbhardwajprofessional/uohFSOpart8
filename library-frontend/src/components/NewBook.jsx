import { useState } from 'react'
import { useMutation } from '@apollo/client'
import { CREATE_BOOK } from "./mutations";
import { ALL_BOOKS, ME, ALL_AUTHORS } from "./queries";

const Notify = ({errorMessage}) => {
  if ( !errorMessage ) {
    return null
  }
  return (
    <div style={{color: 'red'}}>
    {errorMessage}
    </div>
  )
}

const NewBook = (props) => {
  const [error, setError] = useState('')
  const [title, setTitle] = useState('')
  const [author, setAuthor] = useState('')
  const [published, setPublished] = useState(undefined)
  const [genre, setGenre] = useState('')
  const [genres, setGenres] = useState([])

  const notify = (message) => {
    setError(message)
    setTimeout(() => {
      setError(null)
    }, 10000)
  }
  
  const [ newBook ] = useMutation(CREATE_BOOK, {
    refetchQueries: [  {query: ALL_BOOKS}, {query: ME}, {QUERY: ALL_AUTHORS} ],

    onError: (error) => {
      const messages = error.graphQLErrors.map(e => e.message).join('\n')
      notify(messages)
    }
  })

  if (!props.show) {
    return null
  }

  const submit = async (event) => {
    event.preventDefault()

    console.log('add book...')
    newBook({  variables: { title, published, author, genres } })

    setTitle('')
    setPublished(null)
    setAuthor('')
    setGenres([])
    setGenre('')
  }

  const addGenre = () => {
    setGenres(genres.concat(genre))
    setGenre('')
  }

  return (<>
    <Notify errorMessage={error}/>
    <div>
      <form onSubmit={submit}>
        <div>
          title
          <input
            value={title}
            onChange={({ target }) => setTitle(target.value)}
          />
        </div>
        <div>
          author
          <input
            value={author}
            onChange={({ target }) => setAuthor(target.value)}
          />
        </div>
        <div>
          published
          <input
            type="number"
            value={published}
            onChange={({ target }) => setPublished(Number(target.value))}
          />
        </div>
        <div>
          <input
            value={genre}
            onChange={({ target }) => setGenre(target.value)}
          />
          <button onClick={addGenre} type="button">
            add genre
          </button>
        </div>
        <div>genres: {genres.join(' ')}</div>
        <button type="submit">create book</button>
      </form>
    </div>
  </>)
}

export default NewBook