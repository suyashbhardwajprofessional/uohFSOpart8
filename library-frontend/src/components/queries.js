import { gql } from '@apollo/client'

export const ALL_AUTHORS = gql`
  query {
    allAuthors  {
      name
      id
      born
      bookCount
    }
  }
`

export const ALL_BOOKS = gql`
  query {
    allBooks {
      title
      published
      author {
        name
        id
        born
        bookCount
      }
      genres
      id
    }
  }
`

export const LOGIN = gql`
  query {
    allBooks {
      title
      published
      author {
        name
        id
        born
        bookCount
      }
      genres
      id
    }
  }
`

export const ME = gql`
  query {
    me {
      username
      favoriteGenre
      id
    }
  }
`