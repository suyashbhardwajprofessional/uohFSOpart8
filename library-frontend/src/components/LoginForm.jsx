import { useState, useEffect } from 'react'
import { useMutation } from '@apollo/client'
import { LOGIN } from './mutations'
import { ME } from "./queries";

const LoginForm = ({ show, setError, setToken }) => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [notificationMessage, setNotificationMessage] = useState('')

  const [ login, result ] = useMutation(LOGIN, {
    refetchQueries: [ { query: ME }, { query: ME } ],
    onError: (error) => {
      setError(error.graphQLErrors[0].message)
    }
  })

  useEffect(() => {
    if ( result.data ) {
      const token = result.data.login.value
      setNotificationMessage('Successfully Logged in!')
      setTimeout(()=>{
        setToken(token)
        localStorage.setItem('phonenumbers-user-token', token)
        setNotificationMessage('')
      }, 2000);
    }
  }, [result.data])

  if(!show) return null;

  const submit = async (event) => {
    event.preventDefault()
    login({ variables: { username, password } })
    setUsername('')
    setPassword('')
  }

  return (<>
    <div><h4>{notificationMessage}</h4></div>
    <hr/>
    <div>
      <form onSubmit={submit}>
        <div>
          username <input
            value={username}
            onChange={({ target }) => setUsername(target.value)}
          />
        </div>
        <div>
          password <input
            type='password'
            value={password}
            onChange={({ target }) => setPassword(target.value)}
          />
        </div>
        <button type='submit'>login</button>
      </form>
    </div>
  </>)
}

export default LoginForm