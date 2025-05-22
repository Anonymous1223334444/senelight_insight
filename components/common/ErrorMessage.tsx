import { YStack, Text, Button, Paragraph } from 'tamagui';
import { WifiOff } from '@tamagui/lucide-icons'; // Or any other relevant icon

type ErrorMessageProps = {
  message: string;
  onRetry?: () => void;
  details?: string; // Optional: for more detailed error info
};

export function ErrorMessage({ message, onRetry, details }: ErrorMessageProps) {
  return (
    <YStack 
      flex={1} 
      justifyContent="center" 
      alignItems="center" 
      padding="$4" 
      space="$3"
    >
      <WifiOff size={48} color="$red10" />
      <Text fontSize="$6" fontWeight="bold" textAlign="center">
        {message}
      </Text>
      {details && (
        <Paragraph textAlign="center" color="$gray10">
          {details}
        </Paragraph>
      )}
      {onRetry && (
        <Button onPress={onRetry} theme="active">
          Retry
        </Button>
      )}
    </YStack>
  );
}
