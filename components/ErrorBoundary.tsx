import React from 'react';
import { View, StyleSheet } from 'react-native';
import { PixelButton } from './pixel/PixelButton';
import { PixelIcon } from './pixel/PixelIcon';
import { PixelText } from './pixel/PixelText';
import { palette, PIXEL_UNIT } from '../theme/pixel';

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
        <View style={styles.container}>
          <PixelIcon name="boom" size={80} />
          <PixelText variant="title" style={styles.title}>
            Algo salió mal
          </PixelText>
          <PixelText style={styles.message}>
            {this.state.error?.message ?? 'Error inesperado'}
          </PixelText>
          <PixelButton label="Reintentar" onPress={this.handleReset} />
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.ink,
    paddingHorizontal: PIXEL_UNIT * 8,
  },
  title: {
    color: palette.white,
    fontSize: 18,
    lineHeight: 28,
    textAlign: 'center',
    marginTop: PIXEL_UNIT * 6,
    marginBottom: PIXEL_UNIT * 2,
  },
  message: {
    color: palette.fog,
    fontSize: 16,
    textAlign: 'center',
    marginBottom: PIXEL_UNIT * 8,
  },
});
