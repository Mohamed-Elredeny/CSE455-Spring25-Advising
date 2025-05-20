import { useEffect } from 'react'
   import { useNavigate } from 'react-router-dom'
   import { useAuth } from '../core/Auth'
   import axios from 'axios'

   export function GoogleCallback() {
     const { saveAuth, setCurrentUser } = useAuth()
     const navigate = useNavigate()
     const API_URL = import.meta.env.VITE_APP_API_URL

     useEffect(() => {
       const handleCallback = async () => {
         try {
           const response = await axios.get(`${API_URL}/accounts/google/login/callback/`, {
             withCredentials: true
           })
           const { access, refresh, redirect_url } = response.data
           if (access && refresh) {
             const auth = { access, refresh }
             saveAuth(auth)
             setCurrentUser(refresh)
             navigate('/dashboard')
           } else if (redirect_url) {
             window.location.href = redirect_url
           } else {
             throw new Error('No tokens or redirect URL received')
           }
         } catch (error: any) {
           console.error('Google callback error:', error)
           const errorMessage = error.response?.data?.error || 'Google login failed'
           navigate('/auth/login', { state: { error: errorMessage } })
         }
       }

       handleCallback()
     }, [navigate, saveAuth, setCurrentUser])

     return (
       <div className='text-center'>
         <h1>Processing Google Login...</h1>
         <div className='spinner-border' role='status'>
           <span className='visually-hidden'>Loading...</span>
         </div>
       </div>
     )
   }