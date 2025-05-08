import { YStack, Text, Spinner } from "tamagui";
import { ReportItem } from "./ReportItem";
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import { ApolloError, useQuery } from "@apollo/client";
import { Report, GetReportsResponse } from "~/apollo/types";
import { GET_REPORTS_QUERY } from "~/apollo/queries";
import { COLORS } from "~/constants/theme";
import { useAuthStore } from "~/store/authStore";

export const RecentReportsList = () => {
  const { user } = useAuthStore();

  const { 
    data, 
    loading, 
    error 
  } = useQuery<GetReportsResponse>(GET_REPORTS_QUERY, {
    variables: {
      limit: 4
    },
    fetchPolicy: 'cache-and-network'
  });
  
  const reports = data?.reports || [];

  if (loading && !reports.length) {
    return (
      <YStack alignItems="center" paddingVertical="$4">
        <Spinner size="large" color={COLORS.primary} />
      </YStack>
    );
  }

  if (error) {
    return (
      <YStack alignItems="center" paddingVertical="$4">
        <Text color={COLORS.accent}>Erreur de chargement des signalements</Text>
      </YStack>
    );
  }

  if (!reports || reports.length === 0) {
    return (
      <YStack alignItems="center" paddingVertical="$4">
        <Text color={COLORS.textSecondary}>Aucun signalement trouvé</Text>
      </YStack>
    );
  }

  return (
    <YStack space={8}>
      {reports.map((report) => (
        <ReportItem
          key={report.id}
          id={Number(report.id)}
          impactType={report.impactType.name}
          emoji={report.impactType.emoji}
          date={format(parseISO(report.reportDate), "EEE d MMM", { locale: fr })}
          description={report.description}
          status={report.networkStatus}
        />
      ))}
    </YStack>
  );
};