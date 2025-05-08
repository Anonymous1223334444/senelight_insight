import { XStack, YStack, Text, View } from "tamagui";
import * as Haptics from 'expo-haptics';
import { TouchableOpacity } from 'react-native';
import { NetworkStatus } from "~/apollo/types";
import { COLORS, networkStatusColors } from "~/constants/theme";
import { useRouter } from "expo-router";

type ReportItemProps = {
  id: number;
  impactType: string;
  emoji: string;
  date: string;
  description: string;
  status: NetworkStatus;
}

export const ReportItem = ({
  id,
  impactType,
  emoji,
  date,
  description,
  status,
}: ReportItemProps) => {
  const router = useRouter();
  const statusColor = networkStatusColors[status];
  
  return (
    <TouchableOpacity 
      onPress={() => {
        Haptics.selectionAsync();
        router.push({
          pathname: '/report/[id]',
          params: { id }
        });
      }}
    >
      <XStack
        backgroundColor={"#fff"}
        borderRadius={12}
        padding={"$4"}
        justifyContent="space-between"
        alignItems="center"
      >
        <XStack alignItems="center" space="$3">
          <View
            padding="$2"
            backgroundColor={COLORS.accentLight}
            borderRadius={8}
            alignItems="center"
            justifyContent="center"
            width={40}
            height={40}
          >
            <Text fontSize={18}>
              {emoji}
            </Text>
          </View>
          
          <YStack flex={1}>
            <Text
              fontSize={16}
              fontWeight="500"
              color={COLORS.textPrimary}
            >
              {impactType}
            </Text>
            
            {description ? (
              <Text
                fontSize={14}
                color={COLORS.textSecondary}
                numberOfLines={1}
              >
                {description}
              </Text>
            ) : null}
            
            <XStack alignItems="center" space="$2" marginTop={2}>
              <Text
                fontSize={12}
                color={COLORS.textTertiary}
              >
                {date}
              </Text>
              <View
                width={8}
                height={8}
                borderRadius={4}
                backgroundColor={statusColor}
                marginLeft={4}
              />
              <Text
                fontSize={12}
                color={statusColor}
              >
                {status === NetworkStatus.SENT ? 'Envoyé' : 
                 status === NetworkStatus.PENDING ? 'En attente' : 'Échec'}
              </Text>
            </XStack>
          </YStack>
        </XStack>
      </XStack>
    </TouchableOpacity>
  );
};