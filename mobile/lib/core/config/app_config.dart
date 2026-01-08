class AppConfig {
  static const String appName = 'AttachFlow';
  static const String appVersion = '1.0.0';

  // API Configuration
  static const String baseUrl = 'https://attachflow.com/api';
  static const String webUrl = 'https://attachflow.com';

  // Firebase Configuration
  static const String firebaseProjectId = 'attachflow-project';

  // Feature Flags
  static const bool enableAnalytics = true;
  static const bool enableCrashReporting = true;
  static const bool enableOfflineMode = true;

  // UI Configuration
  static const Duration animationDuration = Duration(milliseconds: 300);
  static const Duration splashDuration = Duration(seconds: 2);

  // Cache Configuration
  static const Duration cacheExpiry = Duration(hours: 24);
  static const int maxCacheSize = 100; // MB

  // Pagination
  static const int defaultPageSize = 20;
  static const int maxPageSize = 100;
}
