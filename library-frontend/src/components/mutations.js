import { gql } from '@apollo/client'

export const CREATE_BOOK = gql`
  mutation newBook($title: String!, $published: Int!, $author: String!, $genres: [String!]) {
    addBook(
      title: $title,
      published: $published,
      author: $author,
      genres: $genres
    ) {
      title
      author
      id
    }
  }
`

export const EDIT_BORN = gql`
  mutation updateAuthor($name: String!, $setBornTo: Int!) {
    editAuthor(
      name: $name,
      setBornTo: $setBornTo,
    ) {
      name
      born
      id
      bookCount
    }
  }
`