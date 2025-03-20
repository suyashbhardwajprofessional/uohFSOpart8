import { gql } from '@apollo/client'

const BOOK_DETAILS = gql`
  fragment BookDetails on Book {
    title
    published
    author {
      name
      born
      bookCount
    }
    genres
    id
  }
`

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

export const ALL_BOOKS_BY_GENRE = gql`
  query Query($genre: String!) {
    allBooksOfGenre(genre: $genre) {
      title
      published
      author {
        name
        born
        bookCount
      }
      genres
      id
    }
  }
`

export const BOOK_ADDED = gql`
  subscription {
    bookAdded {
      ...BookDetails
    }
  }
  ${BOOK_DETAILS}
`