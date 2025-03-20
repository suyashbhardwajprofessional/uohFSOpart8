const { GraphQLError } = require('graphql');
const jwt = require('jsonwebtoken');
const Book = require('./models/book');
const Author = require('./models/author');
const User = require('./models/user');
const { v4: uuidv4 } = require('uuid');

const { PubSub } = require('graphql-subscriptions')
const publishToSubscribers = new PubSub()

const resolvers = {
  Query: {
    bookCount: async () => Book.collection.countDocuments(),

    authorCount: async () => Author.collection.countDocuments(),

    allBooks: async (root, args) => {
      return Book.find({});
    },

    allAuthors: async (root, args) => {
      return Author.find({});
    },

    allBooksByAuthor: async (root, args) => {
      const skeyAuthor = await Author.findOne({ name: args.author });
      return Book.find({ author: skeyAuthor._id.toString() });
    },

    allBooksOfGenre: async (root, args) => Book.find({ genres: { $in: [args.genre] } }),

    me: (root, args, context) => {
      return context.currentUser;
    },
    
  },

  Author: {
    bookCount: async root => {
      return Book.find({ author: root._id }).countDocuments();
    },
  },

  Book: {
    author: async root => {
      return Author.findById(root.author);
    },
  },

  Mutation: {
    addBook: async (root, args, context) => {
      const currentUser = context.currentUser;
      if (!currentUser) {
        throw new GraphQLError('not authenticated', {
          extensions: {
            code: 'BAD_USER_INPUT',
          },
        });
      }

      const theBookAuthor = await Author.findOne({ name: args.author });
      let theAuthor;
      if (!theBookAuthor) {
        theAuthor = await new Author({ name: args.author, id: uuidv4() });
        try {
          await theAuthor.save();
        } catch (error) {
          throw new GraphQLError('Saving author failed', {
            extensions: {
              code: 'BAD_USER_INPUT',
              invalidArgs: args.name,
              error,
            },
          });
        }
        console.log('author was not found, now made!');
      } else {
        theAuthor = theBookAuthor;
        console.log('author was already there in database, linked!', theAuthor);
      }
      const book = new Book({ ...args, author: theAuthor, id: uuidv4() });
      console.log('new book object set up, ready to save', book);
      try {
        await book.save();
      } catch (error) {
        throw new GraphQLError('Saving book failed', {
          extensions: {
            code: 'BAD_USER_INPUT',
            invalidArgs: args.name,
            error,
          },
        });
      }

    /*Adding a new book publishes a notification about the operation to all subscribers with PubSub's method publish*/
      publishToSubscribers.publish('BOOK_ADDED', { bookAdded: book })
      return book;
    },

    editAuthor: async (root, args) => {
      console.log('root is ', root);
      console.log('args is ', args);
      const authorInQuestion = await Author.findOne({ name: args.name });
      if (!authorInQuestion) {
        console.log('did not find an author');
        return null;
      }
      const locateQuery = { name: args.name };
      console.log('found author ', authorInQuestion);
      let updateRes;
      try {
        updateRes = await Author.findOneAndUpdate(locateQuery, { born: args.setBornTo }, { new: false });
      } catch (error) {
        throw new GraphQLError('Editing author failed', {
          extensions: {
            code: 'BAD_USER_INPUT',
            invalidArgs: args.name,
            error,
          },
        });
      }
      return updateRes;
      console.log('made an updated');
    },

    createUser: async (root, args) => {
      const user = new User({ username: args.username, favoriteGenre: args.favoriteGenre });

      return user.save().catch(error => {
        throw new GraphQLError('Creating the user failed', {
          extensions: {
            code: 'BAD_USER_INPUT',
            invalidArgs: args.username,
            error,
          },
        });
      });
    },

    login: async (root, args) => {
      const user = await User.findOne({ username: args.username });

      if (!user || args.password !== 'secret') {
        throw new GraphQLError('wrong credentials', {
          extensions: {
            code: 'BAD_USER_INPUT',
          },
        });
      }

      const userForToken = {
        username: user.username,
        id: user._id,
      };

      return { value: jwt.sign(userForToken, process.env.JWT_SECRET) };
    },
  },

  Subscription: {

    /*The resolver of the bookAdded subscription registers and saves info about all the clients that do the subscription. 
    The clients are saved to an "iterator object" called BOOK_ADDED */
    bookAdded: {
      subscribe: () => publishToSubscribers.asyncIterator('BOOK_ADDED')
    },
  },
};

module.exports = resolvers