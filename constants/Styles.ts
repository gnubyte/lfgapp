import { StyleSheet } from 'react-native';
import { Colors } from './Colors';

export const GlobalStyles = StyleSheet.create({
  // Container Styles
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  
  safeArea: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },

  // Card Styles
  card: {
    backgroundColor: Colors.dark.card,
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },

  cardCompact: {
    backgroundColor: Colors.dark.card,
    borderRadius: 8,
    padding: 12,
    marginVertical: 4,
    marginHorizontal: 16,
  },

  // Header Styles
  header: {
    backgroundColor: Colors.dark.surface,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.border,
  },

  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.dark.text.primary,
  },

  headerSubtitle: {
    fontSize: 16,
    color: Colors.dark.text.secondary,
    marginTop: 4,
  },

  // Button Styles
  button: {
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },

  buttonPrimary: {
    backgroundColor: Colors.primary.purple,
  },

  buttonSecondary: {
    backgroundColor: Colors.primary.green,
  },

  buttonTertiary: {
    backgroundColor: Colors.primary.blue,
  },

  buttonWarning: {
    backgroundColor: Colors.primary.yellow,
  },

  buttonDanger: {
    backgroundColor: Colors.primary.red,
  },

  buttonOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Colors.primary.purple,
  },

  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.dark.text.primary,
  },

  buttonTextOutline: {
    color: Colors.primary.purple,
  },

  // Text Styles
  textTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.dark.text.primary,
  },

  textSubtitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.dark.text.primary,
  },

  textBody: {
    fontSize: 16,
    color: Colors.dark.text.primary,
    lineHeight: 24,
  },

  textCaption: {
    fontSize: 14,
    color: Colors.dark.text.secondary,
  },

  textMuted: {
    fontSize: 14,
    color: Colors.dark.text.muted,
  },

  // Input Styles
  input: {
    backgroundColor: Colors.dark.surface,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: Colors.dark.text.primary,
  },

  inputFocused: {
    borderColor: Colors.primary.purple,
  },

  inputError: {
    borderColor: Colors.status.error,
  },

  // Icon Styles
  icon: {
    fontSize: 24,
  },

  iconSmall: {
    fontSize: 16,
  },

  iconLarge: {
    fontSize: 32,
  },

  // Feature Card Styles
  featureCard: {
    backgroundColor: Colors.dark.card,
    borderRadius: 12,
    padding: 20,
    marginVertical: 8,
    marginHorizontal: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },

  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },

  featureTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.dark.text.primary,
    marginBottom: 8,
    textAlign: 'center',
  },

  featureDescription: {
    fontSize: 14,
    color: Colors.dark.text.secondary,
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 20,
  },

  // Activity Styles
  activityCard: {
    backgroundColor: Colors.dark.card,
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    marginHorizontal: 16,
  },

  activityMetric: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },

  activityMetricValue: {
    fontSize: 20,
    fontWeight: '700',
    marginRight: 8,
  },

  activityMetricLabel: {
    fontSize: 16,
    color: Colors.dark.text.secondary,
  },

  // List Styles
  listItem: {
    backgroundColor: Colors.dark.card,
    borderRadius: 8,
    padding: 16,
    marginVertical: 4,
    marginHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },

  listItemIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  listItemContent: {
    flex: 1,
  },

  listItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.dark.text.primary,
    marginBottom: 4,
  },

  listItemSubtitle: {
    fontSize: 14,
    color: Colors.dark.text.secondary,
  },

  // Empty State Styles
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },

  emptyStateIcon: {
    fontSize: 48,
    color: Colors.dark.text.muted,
    marginBottom: 16,
  },

  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.dark.text.primary,
    marginBottom: 8,
    textAlign: 'center',
  },

  emptyStateDescription: {
    fontSize: 14,
    color: Colors.dark.text.secondary,
    textAlign: 'center',
    lineHeight: 20,
  },

  // Loading Styles
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.dark.background,
  },

  loadingText: {
    fontSize: 16,
    color: Colors.dark.text.secondary,
    marginTop: 16,
  },
});

// Feature-specific color styles
export const getFeatureStyles = (feature: keyof typeof Colors.features) => ({
  backgroundColor: Colors.features[feature],
  color: Colors.dark.text.primary,
});

// Activity-specific color styles
export const getActivityStyles = (activity: keyof typeof Colors.activity) => ({
  color: Colors.activity[activity],
});
