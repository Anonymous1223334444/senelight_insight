import { TouchableOpacity, ActivityIndicator } from 'react-native';
import { Text, styled, YStack, XStack } from 'tamagui';
import { COLORS } from '~/constants/theme';
import * as Haptics from 'expo-haptics';

type ButtonProps = {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  marginBottom?: string | number;
  marginTop?: string | number;
  marginVertical?: string | number;
  icon?: React.ReactNode;
};

export const Button = ({
  title,
  onPress,
  disabled = false,
  loading = false,
  variant = 'primary',
  marginBottom,
  marginTop,
  marginVertical,
  icon
}: ButtonProps) => {
  const getBackgroundColor = () => {
    if (disabled || loading) {
      return variant === 'primary' ? `${COLORS.primary}80` : 
             variant === 'danger' ? `${COLORS.accent}80` : 
             variant === 'outline' ? 'transparent' : 
             `${COLORS.primaryLight}80`;
    }
    
    return variant === 'primary' ? COLORS.primary : 
           variant === 'danger' ? COLORS.accent : 
           variant === 'outline' ? 'transparent' : 
           COLORS.primaryLight;
  };
  
  const getTextColor = () => {
    if (disabled || loading) {
      return variant === 'outline' || variant === 'secondary' ? `${COLORS.primary}80` : 'white';
    }
    
    return variant === 'outline' || variant === 'secondary' ? COLORS.primary : 'white';
  };
  
  const getBorderColor = () => {
    return variant === 'outline' ? 
      (disabled || loading ? `${COLORS.primary}80` : COLORS.primary) : 
      'transparent';
  };

  return (
    <TouchableOpacity
      onPress={() => {
        if (!disabled && !loading) {
          Haptics.selectionAsync();
          onPress();
        }
      }}
      disabled={disabled || loading}
      style={{
        backgroundColor: getBackgroundColor(),
        borderRadius: 10,
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: variant === 'outline' ? 1 : 0,
        borderColor: getBorderColor(),
        marginBottom,
        marginTop,
        marginVertical,
        opacity: disabled || loading ? 0.8 : 1,
      }}
    >
      {loading ? (
        <XStack space="$2" alignItems="center">
          <ActivityIndicator size="small" color={getTextColor()} />
          <Text color={getTextColor()} fontWeight="600">Chargement...</Text>
        </XStack>
      ) : (
        <XStack space="$2" alignItems="center">
          {icon}
          <Text color={getTextColor()} fontWeight="600" fontSize={16}>
            {title}
          </Text>
        </XStack>
      )}
    </TouchableOpacity>
  );
};