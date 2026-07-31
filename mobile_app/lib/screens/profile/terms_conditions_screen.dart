import 'package:flutter/material.dart';

class TermsConditionsScreen extends StatelessWidget {
  const TermsConditionsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final bgColor = isDark ? const Color(0xFF1E1E1E) : Colors.white;
    final textColor = isDark ? Colors.white : const Color(0xFF1F2937);
    final secondaryTextColor = isDark ? Colors.grey.shade400 : Colors.grey.shade600;

    return Scaffold(
      backgroundColor: bgColor,
      appBar: AppBar(
        backgroundColor: bgColor,
        elevation: 0,
        centerTitle: false,
        leading: IconButton(
          icon: Icon(Icons.arrow_back_ios_new_rounded, color: textColor, size: 20),
          onPressed: () => Navigator.pop(context),
        ),
        title: Text(
          'Terms and conditions',
          style: TextStyle(
            color: textColor,
            fontSize: 18,
            fontWeight: FontWeight.w600,
          ),
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Welcome to Maths Point!',
              style: TextStyle(color: textColor, fontSize: 18, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 16),
            Text(
              'By accessing and using this application, you accept and agree to be bound by the terms and provision of this agreement. In addition, when using this application\'s particular services, you shall be subject to any posted guidelines or rules applicable to such services.',
              style: TextStyle(color: secondaryTextColor, fontSize: 15, height: 1.5),
            ),
            const SizedBox(height: 24),
            Text(
              '1. Acceptance of Terms',
              style: TextStyle(color: textColor, fontSize: 16, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 8),
            Text(
              'Your use of the services is subject to these Terms and Conditions. You may not use the services if you do not accept the terms.',
              style: TextStyle(color: secondaryTextColor, fontSize: 15, height: 1.5),
            ),
            const SizedBox(height: 24),
            Text(
              '2. User Accounts',
              style: TextStyle(color: textColor, fontSize: 16, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 8),
            Text(
              'You must provide accurate, current and complete information during the registration process and keep your account up-to-date at all times. You are responsible for safeguarding your password.',
              style: TextStyle(color: secondaryTextColor, fontSize: 15, height: 1.5),
            ),
            const SizedBox(height: 40),
          ],
        ),
      ),
    );
  }
}
