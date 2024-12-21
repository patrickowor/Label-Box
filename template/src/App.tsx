/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react'
import Login from './component/login'
import './App.css'
import Header from './component/header'
import ErrorPage from './component/error'
import Project from './component/projects'


type SetError = (string: any) => void;

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [userAuth, setUserAuth] = useState<string | null>(null)
  const [error, setError] = useState(null)

  const changeState = (arg: string) => {
    if (arg == null || arg.trim() == '')  return;
    localStorage.setItem('labelBox-auth', arg)
    setUserAuth(arg);
    setIsAuthenticated(true)
  };

  const logout = () => {
    localStorage.removeItem('labelBox-auth')
    setIsAuthenticated(false)
  }

  useEffect(() => {
    const auth = localStorage.getItem('labelBox-auth')

    if (auth != null){
      setUserAuth(auth);
      setIsAuthenticated(true)
    }
  }, [isAuthenticated])

  return (
    <>
      <ErrorPage error={error} setError={setError} />
      <Header isAuthenticated={isAuthenticated} logout={logout} />
      {isAuthenticated ? (
        <Project
          auth={userAuth}
          setError={setError as SetError}
          logout={logout}
        />
      ) : (
        <Login
          setIsauthenticated={changeState}
          setError={setError as SetError}
        />
      )}
    </>
  );
}

export default App
