import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_crashlytics/firebase_crashlytics.dart';
import 'dart:ui';
import 'core/theme/app_theme.dart';
import 'core/theme/theme_provider.dart';
import 'core/services/api_service.dart';
import 'screens/auth/login_screen.dart';
import 'screens/main_layout.dart';
import 'firebase_options.dart';

final GlobalKey<NavigatorState> navigatorKey = GlobalKey<NavigatorState>();

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  // Initialize Firebase and Crashlytics
  await Firebase.initializeApp(
    options: DefaultFirebaseOptions.currentPlatform,
  );
  FlutterError.onError = FirebaseCrashlytics.instance.recordFlutterFatalError;
  PlatformDispatcher.instance.onError = (error, stack) {
    FirebaseCrashlytics.instance.recordError(error, stack, fatal: true);
    return true;
  };

  await ApiService.loadToken();
  runApp(const MathsPointApp());
}

class MathsPointApp extends StatelessWidget {
  const MathsPointApp({super.key});

  @override
  Widget build(BuildContext context) {
    // If token exists, go straight to home; otherwise show login
    final initialRoute = ApiService.authToken != null ? '/home' : '/login';

    return MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => ThemeProvider()),
        Provider<int>.value(value: 0),
      ],
      child: Consumer<ThemeProvider>(
        builder: (context, themeProvider, child) {
          return MaterialApp(
            navigatorKey: navigatorKey,
            title: 'Maths Point',
            themeMode: themeProvider.themeMode,
            theme: AppTheme.lightTheme,
            darkTheme: AppTheme.darkTheme,
            debugShowCheckedModeBanner: false,
            initialRoute: initialRoute,
            routes: {
              '/login': (context) => const LoginScreen(),
              '/home': (context) => const MainLayout(),
            },
          );
        },
      ),
    );
  }
}
