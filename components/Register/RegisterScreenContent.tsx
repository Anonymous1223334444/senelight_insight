import { YStack, Theme, Image, View, Text } from 'tamagui';
import { TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { Link } from 'expo-router';
import { Button } from '~/components/Button';
import { Input } from '~/components/Input';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { 
  ArrowLongLeftIcon,
  UserIcon,
  EnvelopeIcon,
  LockClosedIcon,
  KeyIcon,
  PhoneIcon
} from 'react-native-heroicons/outline';
import { useRouter } from 'expo-router';
import { useMutation } from '@apollo/client';
import { CREATE_USER_MUTATION } from '~/apollo/mutations';
import { useState } from 'react';
import { COLORS } from '~/constants/theme';

export const ScreenContent = () => {
  const { top } = useSafeAreaInsets();
  const router = useRouter();
  
  // État local au lieu de useRegisterStore
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const [createUser, { loading }] = useMutation(CREATE_USER_MUTATION);
  
  const handleRegister = async () => {
    // Validation
    if (!name.trim()) {
      Alert.alert('Erreur', 'Veuillez entrer votre nom');
      return;
    }
    if (!email.trim()) {
      Alert.alert('Erreur', 'Veuillez entrer votre email');
      return;
    }
    if (!password) {
      Alert.alert('Erreur', 'Veuillez entrer un mot de passe');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Erreur', 'Le mot de passe doit comporter au moins 6 caractères');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Erreur', 'Les mots de passe ne correspondent pas');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const { data } = await createUser({
        variables: {
          createUserInput: {
            name,
            email,
            password,
            phone: phone || undefined
          }
        }
      });
      
      if (data?.createUser) {
        Alert.alert('Succès', 'Compte créé avec succès', [
          { 
            text: 'OK', 
            onPress: () => {
              // Réinitialiser le formulaire
              setName('');
              setEmail('');
              setPassword('');
              setConfirmPassword('');
              setPhone('');
              // Naviguer vers la page de connexion
              router.replace('/login');
            } 
          }
        ]);
      }
    } catch (error) {
      Alert.alert('Erreur', error instanceof Error ? error.message : 'Échec de la création du compte');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Theme name="light">
      <YStack flex={1} padding="$4">
        <YStack
          flex={1}
          paddingTop={top}
          alignItems="center"
          justifyContent="center"
        >
          <TouchableOpacity
            style={{
              backgroundColor: COLORS.primaryLight,
              padding: 12,
              borderRadius: 1000,
              alignSelf: 'flex-start'
            }}
            onPress={() => router.back()}
          >
            <ArrowLongLeftIcon size={25} color={COLORS.primary} />
          </TouchableOpacity>

          <View
            flex={1}
            width={"100%"}
            padding={"$4"}
            borderRadius={"$10"}
            backgroundColor={COLORS.primaryLight}
            marginTop={"$2"}
          >
            <Text
              fontSize={32}
              fontWeight={"bold"}
              textAlign={"center"}
              marginBottom={"$2"}
              color={COLORS.primary}
            >
              Créer un compte
            </Text>
            <Text
              fontSize={16}
              textAlign={"center"}
              marginBottom={"$4"}
              color={COLORS.textSecondary}
            >
              Inscrivez-vous pour commencer
            </Text>
            
            <Input
              placeholder="Nom complet"
              autoCapitalize="words"
              autoCorrect={false}
              icon={<UserIcon size={20} color={COLORS.textTertiary} />}
              value={name}
              onChangeText={setName}
            />
            
            <Input
              placeholder="Email"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              icon={<EnvelopeIcon size={20} color={COLORS.textTertiary} />}
              value={email}
              onChangeText={setEmail}
            />
            
            <Input
              placeholder="Téléphone (optionnel)"
              keyboardType="phone-pad"
              autoCapitalize="none"
              autoCorrect={false}
              icon={<PhoneIcon size={20} color={COLORS.textTertiary} />}
              value={phone}
              onChangeText={setPhone}
            />
            
            <Input
              placeholder="Mot de passe"
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
              icon={<LockClosedIcon size={20} color={COLORS.textTertiary} />}
              value={password}
              onChangeText={setPassword}
            />
            
            <Input
              placeholder="Confirmer le mot de passe"
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
              icon={<KeyIcon size={20} color={COLORS.textTertiary} />}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />
            
            <Button 
              title="S'inscrire" 
              marginBottom={"$4"} 
              onPress={handleRegister}
              disabled={isLoading || loading}
              loading={isLoading || loading}
            />
            
            <View paddingBottom={"$4"}>
              <Link href={{ pathname: '/login' }} asChild>
                <Text color={COLORS.primary} textAlign='center'>
                  Vous avez déjà un compte ? Connectez-vous
                </Text>
              </Link>
            </View>
          </View>
        </YStack>
      </YStack>
    </Theme>
  );
};