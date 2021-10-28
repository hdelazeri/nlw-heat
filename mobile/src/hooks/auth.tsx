import React, { createContext, ReactNode, useContext, useEffect, useState } from "react";
import * as AuthSession from 'expo-auth-session';
import AsyncStorage from "@react-native-async-storage/async-storage";

import { api } from "../services/api";

const CLIENT_ID = 'c450b8630166234d9242';
const SCOPE = 'read:user';
const USER_STORAGE = '@dowhile:user';
const TOKEN_STORAGE = '@dowhile:token';

type User = {
  id: string
  name: string
  avatar_url: string
  login: string
}

type AuthContextData = {
  user: User | null
  isSigningIn: boolean
  signIn: () => Promise<void>
  signOut: () => Promise<void>
}

type AuthProviderProps = {
  children: ReactNode
}

type AuthResponse = {
  token: string
  user: User
}

type AuthorizationResponse = {
  params: {
    code?: string
    error?: string
  },
  type?: string
}

export const AuthContext = createContext({} as AuthContextData);

function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [isSigningIn, setIsSigningIn] = useState(true)

  async function signIn() {
    try {
      setIsSigningIn(true)

      const authUrl = `https://github.com/login/oauth/authorize?client_id=${CLIENT_ID}&scope=${SCOPE}`
      const authSessionResponse = await AuthSession.startAsync({ authUrl }) as AuthorizationResponse

      if (authSessionResponse.type === 'success' && authSessionResponse.params.error !== 'access_denied') {
        const authResponse = await api.post<AuthResponse>('/authenticate', { code: authSessionResponse.params.code })

        const { user, token } = authResponse.data

        api.defaults.headers.common['Authorization'] = `Bearer ${token}`

        await AsyncStorage.setItem(USER_STORAGE, JSON.stringify(user))
        await AsyncStorage.setItem(TOKEN_STORAGE, token)

        setUser(user)
      }
    } catch (error) {
      console.log(error)
    } finally {
      setIsSigningIn(false)
    }
  }

  async function signOut() {
    setUser(null)
    await AsyncStorage.removeItem(USER_STORAGE)
    await AsyncStorage.removeItem(TOKEN_STORAGE)
  }

  useEffect(() => {
    async function loadUserStorageData() {
      const userStorage = await AsyncStorage.getItem(USER_STORAGE)
      const tokenStorage = await AsyncStorage.getItem(TOKEN_STORAGE)

      if (userStorage && tokenStorage) {
        api.defaults.headers.common['Authorization'] = `Bearer ${tokenStorage}`
        setUser(JSON.parse(userStorage))
      }

      setIsSigningIn(false)
    }

    loadUserStorageData()
  }, [])

  return (
    <AuthContext.Provider value={{ signIn, signOut, user, isSigningIn }}>
      { children }
    </AuthContext.Provider>
  )
}

function useAuth() {
  const context = useContext(AuthContext)

  return context
}

export { AuthProvider, useAuth }