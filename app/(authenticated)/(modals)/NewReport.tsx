import React from 'react';
import { View } from 'tamagui';
import { ModalContent } from '~/components/(authenticated)/(modals)/NewReport/NewReportModal';

export default function NewReport() {
  return (
    <View flex={1}>
      <ModalContent />
    </View>
  );
}