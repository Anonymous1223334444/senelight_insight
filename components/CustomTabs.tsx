import { TouchableOpacity, ViewStyle } from 'react-native';
import { Text } from '@react-navigation/elements';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { XStack, YStack } from 'tamagui';
import * as Haptics from 'expo-haptics';
import { COLORS } from '~/constants/theme';

export default function CustomTabs({ state, descriptors, navigation }: BottomTabBarProps) {
    return (
    <XStack 
        width="90%" 
        height={70} 
        backgroundColor="white"
        borderRadius={28}
        marginHorizontal="5%"
        marginBottom={16}
        position="absolute"
        bottom={0}
        shadowColor="rgba(0, 0, 0, 0.1)"
        shadowOffset={{ width: 0, height: -2 }}
        shadowOpacity={0.5}
        shadowRadius={5}
        elevation={5}
    >
        {state.routes.map((route, index) => {
            const { options } = descriptors[route.key];
            
            const label =
            options.tabBarLabel !== undefined
                ? options.tabBarLabel
                : options.title !== undefined
                ? options.title
                : route.name;

            const isFocused = state.index === index;

            const onPress = () => {
                const event = navigation.emit({
                    type: 'tabPress',
                    target: route.key,
                    canPreventDefault: true,
                });

                if (!isFocused && !event.defaultPrevented) {
                    navigation.navigate(route.name, { merge: true });
                }
            };

            const onLongPress = () => {
                navigation.emit({
                    type: 'tabLongPress',
                    target: route.key,
                });
            };


            const icon = options.tabBarIcon 
            ? options.tabBarIcon({ 
                focused: isFocused, 
                color: isFocused ? COLORS.primary : COLORS.textTertiary, 
                size: 24 
                }) 
            : null;

            return (
            <TouchableOpacity
                key={route.key}
                accessibilityRole="button"
                accessibilityState={isFocused ? { selected: true } : {}}
                accessibilityLabel={options.tabBarAccessibilityLabel}
                testID={options.tabBarButtonTestID}
                onPress={() => {
                    Haptics.selectionAsync();
                    onPress();
                }}
                onLongPress={onLongPress}
                style={{ 
                    flex: 1,
                    justifyContent: 'center',
                    alignItems: 'center',
                    borderRadius: 28,
                    overflow: 'hidden'
                } as ViewStyle}
            >
                <YStack alignItems="center" justifyContent="center" paddingVertical={10}>
                    {icon}
                    <Text 
                        style={{ 
                            color: isFocused ? COLORS.primary : COLORS.textTertiary,
                            fontSize: 12,
                            marginTop: 4,
                            fontWeight: isFocused ? '600' : '400'
                        }}
                    >
                        {typeof label === 'string' ? label : ''}
                    </Text>
                </YStack>
            </TouchableOpacity>
            );
        })}
    </XStack>
    );
}