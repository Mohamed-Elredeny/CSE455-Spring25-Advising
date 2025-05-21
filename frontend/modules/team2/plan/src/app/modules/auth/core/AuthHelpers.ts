import {AuthModel} from './_models'
import axios from 'axios'

const AUTH_LOCAL_STORAGE_KEY = 'kt-auth-react-v'
const getAuth = (): AuthModel | undefined => {
  if (!localStorage) {
    return
  }

  const lsValue: string | null = localStorage.getItem(AUTH_LOCAL_STORAGE_KEY)
  if (!lsValue) {
    return
  }

  try {
    const auth: AuthModel = JSON.parse(lsValue) as AuthModel
    if (auth) {
      // You can easily check auth_token expiration also
      return auth
    }
  } catch (error) {
    console.error('AUTH LOCAL STORAGE PARSE ERROR', error)
  }
}

const setAuth = (auth: AuthModel) => {
  if (!localStorage) {
    return
  }

  try {
    const lsValue = JSON.stringify(auth)
    localStorage.setItem(AUTH_LOCAL_STORAGE_KEY, lsValue)
  } catch (error) {
    console.error('AUTH LOCAL STORAGE SAVE ERROR', error)
  }
}

const removeAuth = () => {
  if (!localStorage) {
    return
  }

  try {
    localStorage.removeItem(AUTH_LOCAL_STORAGE_KEY)
  } catch (error) {
    console.error('AUTH LOCAL STORAGE REMOVE ERROR', error)
  }
}

export function setupAxios() {
  axios.defaults.baseURL = import.meta.env.VITE_APP_API_URL
  axios.defaults.headers.common['Accept'] = 'application/json'
  axios.defaults.headers.common['Content-Type'] = 'application/json'
  axios.defaults.withCredentials = true // Enable sending cookies with requests

  // Add request interceptor
  axios.interceptors.request.use(
    (config) => {
      // You can add auth token here if needed
      return config
    },
    (error) => {
      return Promise.reject(error)
    }
  )

  // Add response interceptor
  axios.interceptors.response.use(
    (response) => {
      return response
    },
    (error) => {
      if (error.response) {
        // Server responded with error status
        console.error('Response Error:', error.response.data)
        return Promise.reject({
          status: error.response.status,
          message: error.response.data.message || 'An error occurred',
          data: error.response.data
        })
      } else if (error.request) {
        // Request was made but no response
        console.error('Request Error:', error.request)
        return Promise.reject({
          status: 0,
          message: 'Could not connect to the server',
          data: null
        })
      } else {
        // Something else happened
        console.error('Error:', error.message)
        return Promise.reject({
          status: 0,
          message: error.message,
          data: null
        })
      }
    }
  )
}

export {getAuth, setAuth, removeAuth, AUTH_LOCAL_STORAGE_KEY}
