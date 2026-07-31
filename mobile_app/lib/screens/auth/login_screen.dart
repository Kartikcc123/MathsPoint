import 'package:flutter/material.dart';
import '../../core/services/api_service.dart';
import 'password_login_screen.dart';
import 'user_details_screen.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final TextEditingController _inputController = TextEditingController();
  final ApiService _apiService = ApiService();
  bool _isLoading = false;
  String? _errorMessage;
  bool _isEmailMode = false;

  @override
  void dispose() {
    _inputController.dispose();
    super.dispose();
  }

  void _toggleMode() {
    setState(() {
      _isEmailMode = !_isEmailMode;
      _inputController.clear();
      _errorMessage = null;
    });
  }

  Future<void> _handleContinue() async {
    final input = _inputController.text.trim();
    if (input.isEmpty) {
      setState(() {
        _errorMessage = _isEmailMode ? 'Please enter a valid email address' : 'Please enter a valid mobile number';
      });
      return;
    }

    if (!_isEmailMode && input.length < 10) {
      setState(() {
        _errorMessage = 'Please enter a valid mobile number';
      });
      return;
    }

    if (_isEmailMode && !input.contains('@')) {
      setState(() {
        _errorMessage = 'Please enter a valid email address';
      });
      return;
    }

    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      final exists = _isEmailMode 
          ? await _apiService.checkEmailExists(input)
          : await _apiService.checkPhoneExists(input);
          
      if (mounted) {
        if (exists) {
          Navigator.push(
            context,
            MaterialPageRoute(
              builder: (context) => PasswordLoginScreen(
                identifier: input,
                isEmail: _isEmailMode,
              ),
            ),
          );
        } else {
          Navigator.push(
            context,
            MaterialPageRoute(
              builder: (context) => UserDetailsScreen(
                phone: _isEmailMode ? null : input,
                email: _isEmailMode ? input : null,
              ),
            ),
          );
        }
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _errorMessage = e.toString().replaceAll('Exception: ', '');
        });
      }
    } finally {
      if (mounted) {
        setState(() {
          _isLoading = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    const Color brandBlue = Color(0xFF3284FF);

    return Scaffold(
      backgroundColor: brandBlue,
      body: SafeArea(
        child: LayoutBuilder(
          builder: (context, constraints) {
            bool isDesktop = constraints.maxWidth >= 800;

            if (isDesktop) {
              return Row(
                children: [
                  // Left side - Branding
                  Expanded(
                    child: Center(
                      child: SingleChildScrollView(
                        child: _buildBranding(),
                      ),
                    ),
                  ),
                  // Right side - Login Form
                  Expanded(
                    child: Container(
                      decoration: const BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.horizontal(left: Radius.circular(24)),
                      ),
                      child: Center(
                        child: ConstrainedBox(
                          constraints: const BoxConstraints(maxWidth: 500),
                          child: _buildLoginForm(context, brandBlue),
                        ),
                      ),
                    ),
                  ),
                ],
              );
            } else {
              // Mobile layout
              return Column(
                children: [
                  // Top Section
                  _buildBranding(),
                  // Bottom Section
                  Expanded(
                    child: Container(
                      width: double.infinity,
                      decoration: const BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
                      ),
                      child: _buildLoginForm(context, brandBlue),
                    ),
                  ),
                ],
              );
            }
          },
        ),
      ),
    );
  }

  Widget _buildBranding() {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 40.0, horizontal: 24.0),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          const SizedBox(height: 20),
          // Logo
          ClipRRect(
            borderRadius: BorderRadius.circular(16),
            child: Image.asset(
              'assets/images/logo.jpeg',
              width: 90,
              height: 90,
              fit: BoxFit.cover,
            ),
          ),
          const SizedBox(height: 32),
          const Text(
            'Welcome to Maths Point',
            textAlign: TextAlign.center,
            style: TextStyle(
              fontSize: 26,
              fontWeight: FontWeight.bold,
              color: Colors.white,
            ),
          ),
          const SizedBox(height: 16),
          const Text(
            'Over 10 crore learners trust us for online\nand offline coaching',
            textAlign: TextAlign.center,
            style: TextStyle(
              fontSize: 15,
              color: Colors.white,
              height: 1.4,
            ),
          ),
          const SizedBox(height: 20),
        ],
      ),
    );
  }

  Widget _buildLoginForm(BuildContext context, Color brandBlue) {
    return LayoutBuilder(
      builder: (context, constraints) {
        return SingleChildScrollView(
          child: ConstrainedBox(
            constraints: BoxConstraints(minHeight: constraints.maxHeight),
            child: IntrinsicHeight(
              child: Padding(
                padding: const EdgeInsets.all(24.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.center,
                  children: [
                    const SizedBox(height: 16),
                    Text(
                      _isEmailMode ? 'Enter your email address' : 'Enter your mobile number',
                      style: const TextStyle(
                        fontSize: 16,
                        color: Color(0xFF4B5563),
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                    const SizedBox(height: 24),
                    // Input Field Container
                    Container(
                      decoration: BoxDecoration(
                        border: Border.all(
                            color: _errorMessage != null
                                ? Colors.red
                                : Colors.grey.shade400),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Row(
                        children: [
                          if (!_isEmailMode)
                            // Country Code Prefix for Mobile
                            Container(
                              padding: const EdgeInsets.symmetric(
                                  horizontal: 12, vertical: 16),
                              decoration: BoxDecoration(
                                color: Colors.grey.shade100,
                                borderRadius: const BorderRadius.only(
                                  topLeft: Radius.circular(7),
                                  bottomLeft: Radius.circular(7),
                                ),
                              ),
                              child: Row(
                                mainAxisSize: MainAxisSize.min,
                                children: const [
                                  Text('🇮🇳', style: TextStyle(fontSize: 18)),
                                  SizedBox(width: 8),
                                  Text('+91',
                                      style: TextStyle(
                                          fontSize: 16, color: Colors.black87)),
                                  SizedBox(width: 4),
                                  Icon(Icons.keyboard_arrow_down,
                                      size: 18, color: Colors.black54),
                                ],
                              ),
                            ),
                          // Input Field
                          Expanded(
                            child: TextField(
                              controller: _inputController,
                              keyboardType: _isEmailMode ? TextInputType.emailAddress : TextInputType.phone,
                              style: const TextStyle(
                                  fontSize: 16, letterSpacing: 1.2),
                              decoration: const InputDecoration(
                                border: InputBorder.none,
                                contentPadding:
                                    EdgeInsets.symmetric(horizontal: 16, vertical: 16),
                              ),
                              onChanged: (_) {
                                if (_errorMessage != null) {
                                  setState(() => _errorMessage = null);
                                }
                              },
                            ),
                          ),
                        ],
                      ),
                    ),
                    if (_errorMessage != null)
                      Padding(
                        padding: const EdgeInsets.only(top: 8.0),
                        child: Text(
                          _errorMessage!,
                          style: const TextStyle(color: Colors.red, fontSize: 12),
                        ),
                      ),
                    const SizedBox(height: 32),
                    // Toggle Mode Button
                    TextButton(
                      onPressed: _toggleMode,
                      child: Text(
                        _isEmailMode ? 'LOGIN WITH MOBILE NUMBER' : 'LOGIN WITH EMAIL',
                        style: TextStyle(
                          color: brandBlue,
                          fontWeight: FontWeight.bold,
                          fontSize: 14,
                          letterSpacing: 0.5,
                        ),
                      ),
                    ),
                    const Spacer(),
                    // Continue Button
                    SizedBox(
                      width: double.infinity,
                      height: 50,
                      child: ElevatedButton(
                        onPressed: _isLoading ? null : _handleContinue,
                        style: ElevatedButton.styleFrom(
                          backgroundColor: brandBlue,
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(8),
                          ),
                          elevation: 0,
                        ),
                        child: _isLoading
                            ? const SizedBox(
                                height: 24,
                                width: 24,
                                child: CircularProgressIndicator(
                                  color: Colors.white,
                                  strokeWidth: 2.5,
                                ),
                              )
                            : const Text(
                                'Continue',
                                style: TextStyle(
                                  fontSize: 16,
                                  fontWeight: FontWeight.bold,
                                  color: Colors.white,
                                ),
                              ),
                      ),
                    ),
                    const SizedBox(height: 16),
                  ],
                ),
              ),
            ),
          ),
        );
      },
    );
  }
}

