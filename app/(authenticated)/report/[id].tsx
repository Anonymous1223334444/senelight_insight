import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Container } from '~/components/(authenticated)/Report/ReportContainer';
import { ScreenContent } from '~/components/(authenticated)/Report/ReportScreenContent';

const ReportDetails = () => {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  
  return (
    <>
      <Stack.Screen 
        options={{ 
          headerShown: false
        }} 
      />
      <Container>
        <ScreenContent id={id} />
      </Container>
    </>
  );
}

export default ReportDetails;