import React from 'react';
import { View, Text, Pressable } from 'react-native';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('ErrorBoundary caught:', error, info.componentStack);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <View className="flex-1 items-center justify-center bg-gray-900 px-8">
          <Text className="text-5xl mb-6">💥</Text>
          <Text className="text-white text-2xl font-black mb-2 text-center">Algo salió mal</Text>
          <Text className="text-gray-400 text-sm text-center mb-8">
            {this.state.error?.message ?? 'Error inesperado'}
          </Text>
          <Pressable
            onPress={this.handleReset}
            className="bg-blue-600 py-4 px-8 rounded-2xl active:bg-blue-700"
            accessibilityRole="button"
            accessibilityLabel="Reintentar"
          >
            <Text className="text-white font-bold text-lg">Reintentar</Text>
          </Pressable>
        </View>
      );
    }

    return this.props.children;
  }
}
