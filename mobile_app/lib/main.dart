import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'core/theme/app_theme.dart';
import 'core/theme/theme_provider.dart';
import 'core/services/api_service.dart';
import 'screens/auth/login_screen.dart';
import 'screens/main_layout.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
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
