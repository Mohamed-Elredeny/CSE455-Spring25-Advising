import React, {
  createContext,
  Dispatch,
  FC,
  SetStateAction,
  useContext,
  useEffect,
  useState,
} from 'react'
import {WithChildren} from '../../helpers'
import {toAbsoluteUrl} from '../../helpers'

const MetronicSplashScreenContext = createContext<Dispatch<SetStateAction<number>> | undefined>(
  undefined
)

const MetronicSplashScreenProvider: FC<WithChildren> = ({children}) => {
  const [count, setCount] = useState(0)
  const visible = count > 0

  useEffect(() => {
    // Ensure loading state is properly set on mount
    document.body.classList.add('page-loading')

    // Show SplashScreen
    if (visible) {
      document.body.classList.remove('page-loading')
      return () => {
        document.body.classList.add('page-loading')
      }
    }

    // Hide SplashScreen
    let timeout: number
    if (!visible) {
      timeout = window.setTimeout(() => {
        document.body.classList.add('page-loading')
      }, 3000)
    }

    return () => {
      clearTimeout(timeout)
    }
  }, [visible])

  return (
    <MetronicSplashScreenContext.Provider value={setCount}>
      {children}
    </MetronicSplashScreenContext.Provider>
  )
}

const LayoutSplashScreen: FC = () => {
  return (
    <div id="splash-screen" className="splash-screen">
      <img src={toAbsoluteUrl('media/logos/aiu-logo.png')} className="dark-logo" alt="AIU logo" />
      <img src={toAbsoluteUrl('media/logos/aiu-logo.png')} className="light-logo" alt="AIU logo" />
      <span>Loading ...</span>
    </div>
  )
}

export {MetronicSplashScreenProvider, LayoutSplashScreen}
