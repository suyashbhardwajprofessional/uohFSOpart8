import { useQuery } from '@apollo/client'
import { ALL_BOOKS, ME, ALL_BOOKS_BY_GENRE } from "./queries";
import { useState, useEffect } from 'react'

const Books = ({ show, showRecommended }) => {
  const [filter, setFilter] = useState('')

  const resultUserInfo = useQuery(ME)
  const bookResult = useQuery(ALL_BOOKS)
  const resultByGenre = useQuery(ALL_BOOKS_BY_GENRE, { variables: { genre: filter }, })

  if (bookResult.loading || resultUserInfo.loading || resultByGenre.loading)  {
    return <div>loading...</div>
  }

  if (!show) {
    return null
  }

  const userFavorites = resultUserInfo.data.me ? resultUserInfo.data.me.favoriteGenre : ''
  let appliedFilter = showRecommended ? userFavorites : filter
  console.log('appliedFilter is ', appliedFilter)
  
  const books = bookResult.data.allBooks
  const tempduparr = books.map(bk => bk.genres).flat()
  const uset = new Set(tempduparr)
  const allGenres = [...uset, 'allGenres']

  const booksToDisplay = !showRecommended ? ( resultByGenre.data ? (filter!=='' ? resultByGenre.data.allBooksOfGenre : books )  : []) : books.filter(bk=>bk.genres.includes(userFavorites))

  return (
    <div>
      <h2>{showRecommended?'recommendations':'books'}</h2>
      { showRecommended && <p>books in your favorite genre <strong>{appliedFilter}</strong></p> }
      <table>
        <tbody>
          <tr>
            <th></th>
            <th>author</th>
            <th>published</th>
          </tr>
          {booksToDisplay.length && booksToDisplay.map((a, index) => (
            <tr key={index}>
              <td>{a.title}</td>
              <td>{a.author.name}</td>
              <td>{a.published}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {!showRecommended && 
      <div style={{display: 'flex'}}>
        {allGenres.map((genre, index)=>
          <button key={index} onClick={()=> genre==='allGenres' ? setFilter(''): setFilter(genre)}>
            {genre}
          </button>)
        }
      </div>
      }
    </div>
  )
}

export default Books
