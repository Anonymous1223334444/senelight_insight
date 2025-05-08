import React from 'react';
import { TextInput, TextInputProps, View, StyleSheet } from 'react-native';
import { COLORS } from '~/constants/theme';

interface InputProps extends TextInputProps {
  icon?: React.ReactNode;
  error?: string;
}

export const Input = React.forwardRef<TextInput, InputProps>(
  ({ icon, error, style, ...props }, ref) => {
    return (
      <View style={styles.container}>
        {icon && <View style={styles.iconContainer}>{icon}</View>}
        <TextInput
          ref={ref}
          style={[
            styles.input,
            icon ? { paddingLeft: 45 } : { paddingLeft: 16 },
            error ? { borderColor: COLORS.accent } : {},
            style,
          ]}
          placeholderTextColor={COLORS.textTertiary}
          {...props}
        />
        {error && <Text style={styles.errorText}>{error}</Text>}
      </View>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    width: '100%',
  },
  input: {
    backgroundColor: 'white',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    height: 50,
    paddingHorizontal: 16,
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.textPrimary,
  },
  iconContainer: {
    position: 'absolute',
    left: 16,
    height: 50,
    justifyContent: 'center',
    zIndex: 1,
  },
  errorText: {
    color: COLORS.accent,
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
});