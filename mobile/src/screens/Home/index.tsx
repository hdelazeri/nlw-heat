import React from 'react';
import { KeyboardAvoidingView, Platform } from 'react-native';

import { Header } from '../../components/Header';
import { MessageList } from '../../components/MessageList';
import { SendMessageForm } from '../../components/SendMessageForm';
import { SignInBox } from '../../components/SignInBox';
import { useAuth } from '../../hooks/auth';

import { styles } from './styles';

export function Home() {
  const { user } = useAuth()

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <Header />

      <MessageList />

      { user ? <SendMessageForm /> : <SignInBox />}      
    </KeyboardAvoidingView>
  );
}