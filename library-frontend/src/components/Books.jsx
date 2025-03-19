import { useQuery } from '@apollo/client'
import { ALL_BOOKS, ME } from "./queries";
import { useState, useEffect } from 'react'

const Books = ({ show, showRecommended }) => {
  if (!show) {
    return null
  }
  
  const result = useQuery(ALL_BOOKS)
  const resultUserInfo = useQuery(ME)
  const [filter, setFilter] = useState('')

  if (result.loading || resultUserInfo.loading)  {
    return <div>loading...</div>
  }

  const userFavorites = resultUserInfo.data.me ? resultUserInfo.data.me.favoriteGenre : ''
  let appliedFilter = showRecommended ? userFavorites : filter
  console.log('appliedFilter is ', appliedFilter)
  
  /*useEffect(()=>{
    if(resultUserInfo.data && showRecommended) {
      console.dir(resultUserInfo)
      // setFilter(resultUserInfo.data.me.favoriteGenre)
    }
  },[resultUserInfo.data])*/

  const books = result.data.allBooks
  const tempduparr = books.map(bk => bk.genres).flat()
  const uset = new Set(tempduparr)
  const allGenres = [...uset, 'allGenres']

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
          {books.filter( bk=>filter!='' || showRecommended ? bk.genres.includes(appliedFilter) : true).map((a, index) => (
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
