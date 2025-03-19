import { useState, useEffect } from 'react'
import { useQuery, useMutation } from '@apollo/client'

import { EDIT_BORN } from './mutations'
import { ALL_AUTHORS, ME } from "./queries";

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

const UpdateForm = ({ show }) => {
  if (!show) {
    return null
  }

  const [name, setName] = useState('')
  const [born, setBorn] = useState(undefined)
  const [error, setError] = useState('')

  const [ updateAuthor, result ] = useMutation(EDIT_BORN, {
    refetchQueries: [ { query: ALL_AUTHORS }, { query: ME } ],
    onError: (error) => {
      const messages = error.graphQLErrors.map(e => e.message).join('\n')
      setError(messages)
    }
  })

  const authorResult = useQuery(ALL_AUTHORS)
  if (authorResult.loading)  {
    return <div>loading...</div>
  }

  const authorsToSelectFrom = authorResult.data.allAuthors

  useEffect(() => {
    if (result.data && result.data.editAuthor === null) {
      setError('author not found')
    }
  }, [result.data])

  const submit = async (event) => {
    event.preventDefault()

    updateAuthor({ variables: { name, setBornTo: born } })

    setName('')
    setBorn('')
  }

  return (<>
    <Notify errorMessage={error} />
    <div>
      <h2>update author</h2>

      <form onSubmit={submit}>
        <div>
          select author
          <select onInput={({ target })=>setName(target.value)} value={name}>
            <option value=''>select an author</option>
            {authorsToSelectFrom.map(oneauthor=><option value={oneauthor.name}>{oneauthor.name}</option>)}
          </select>
        </div>
        <div>
          born <input
            value={born}
            onChange={({ target }) => setBorn(Number(target.value))}
          />
        </div>
        <button type='submit'>update author</button>
      </form>
    </div>
  </>)
}

export default UpdateForm