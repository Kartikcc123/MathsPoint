import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/theme/theme_provider.dart';
import '../../core/services/api_service.dart';
import '../auth/login_screen.dart';
import 'report_problem_screen.dart';
import 'terms_conditions_screen.dart';
import 'privacy_policy_screen.dart';
import 'edit_profile_screen.dart';

class SettingsScreen extends StatelessWidget {
  const SettingsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    // Base colors matching the screenshot for dark mode, or adaptive for light
    final bgColor = isDark ? const Color(0xFF1E1E1E) : const Color(0xFFF3F4F6);
    final sectionBgColor = isDark ? const Color(0xFF2C2C2C) : Colors.white;
    final textColor = isDark ? Colors.white : const Color(0xFF1F2937);
    final labelColor = isDark ? Colors.white : const Color(0xFF1F2937);
    final iconBgColor = isDark ? const Color(0xFF8BA5B8) : const Color(0xFF9CA3AF);
    final dividerColor = isDark ? Colors.black : const Color(0xFFE5E7EB);

    return Scaffold(
      backgroundColor: bgColor,
      appBar: AppBar(
        backgroundColor: sectionBgColor,
        elevation: 0,
        centerTitle: false,
        leading: IconButton(
          icon: Icon(Icons.arrow_back_ios_new_rounded, color: textColor, size: 20),
          onPressed: () => Navigator.pop(context),
        ),
        title: Text(
          'Settings',
          style: TextStyle(
            color: textColor,
            fontSize: 18,
            fontWeight: FontWeight.w600,
          ),
        ),
        actions: [
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16.0),
            child: Center(
              child: Text(
                'V 6.180.0',
                style: TextStyle(
                  color: isDark ? Colors.grey.shade400 : Colors.grey.shade600,
                  fontSize: 12,
                  fontWeight: FontWeight.w500,
                ),
              ),
            ),
          ),
        ],
      ),
      body: ListView(
        children: [
          _buildSectionHeader('My account', labelColor),
          Container(
            color: sectionBgColor,
            child: _buildSettingTile(
              icon: Icons.person_rounded,
              title: 'Profile',
              textColor: textColor,
              iconBgColor: iconBgColor,
              onTap: () {
                Navigator.push(context, MaterialPageRoute(builder: (_) => const EditProfileScreen()));
              },
            ),
          ),
          Container(height: 8, color: dividerColor),

          _buildSectionHeader('System', labelColor),
          Container(
            color: sectionBgColor,
            child: Consumer<ThemeProvider>(
              builder: (context, themeProvider, child) {
                return _buildSettingTile(
                  icon: Icons.dark_mode_rounded,
                  title: 'Dark mode',
                  trailingText: themeProvider.isDarkMode ? 'On' : 'Off',
                  textColor: textColor,
                  iconBgColor: iconBgColor,
                  onTap: () {
                    themeProvider.toggleTheme();
                  },
                );
              },
            ),
          ),
          Container(height: 8, color: dividerColor),

          _buildSectionHeader('Feedback', labelColor),
          Container(
            color: sectionBgColor,
            child: Column(
              children: [
                _buildSettingTile(
                  icon: Icons.star_rounded,
                  title: 'Rate the app',
                  textColor: textColor,
                  iconBgColor: iconBgColor,
                ),
                _buildSettingTile(
                  icon: Icons.flag_rounded,
                  title: 'Report a problem',
                  textColor: textColor,
                  iconBgColor: iconBgColor,
                  onTap: () {
                    Navigator.push(context, MaterialPageRoute(builder: (_) => const ReportProblemScreen()));
                  },
                ),
              ],
            ),
          ),
          Container(height: 8, color: dividerColor),

          _buildSectionHeader('Maths Point', labelColor),
          Container(
            color: sectionBgColor,
            child: Column(
              children: [
                _buildSettingTile(
                  icon: Icons.description_rounded,
                  title: 'Terms and conditions',
                  textColor: textColor,
                  iconBgColor: iconBgColor,
                  onTap: () {
                    Navigator.push(context, MaterialPageRoute(builder: (_) => const TermsConditionsScreen()));
                  },
                ),
                _buildSettingTile(
                  icon: Icons.lock_rounded,
                  title: 'Privacy policy',
                  textColor: textColor,
                  iconBgColor: iconBgColor,
                  onTap: () {
                    Navigator.push(context, MaterialPageRoute(builder: (_) => const PrivacyPolicyScreen()));
                  },
                ),
              ],
            ),
          ),
          Container(height: 8, color: dividerColor),

          Container(
            color: sectionBgColor,
            child: _buildSettingTile(
              icon: Icons.arrow_back_rounded,
              title: 'Sign out',
              textColor: textColor,
              iconBgColor: iconBgColor,
              showChevron: false,
              onTap: () async {
                await ApiService.clearToken();
                if (context.mounted) {
                  Navigator.pushReplacementNamed(context, '/login');
                }
              },
            ),
          ),
          Container(height: 8, color: dividerColor),

          // Delete account
          GestureDetector(
            onTap: () {},
            child: Container(
              width: double.infinity,
              color: bgColor,
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 24),
              child: const Text(
                'Delete account',
                style: TextStyle(
                  color: Color(0xFFEF4444), // Red color
                  fontSize: 16,
                  fontWeight: FontWeight.w500,
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSectionHeader(String title, Color color) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(20, 24, 20, 12),
      child: Text(
        title,
        style: TextStyle(
          color: color,
          fontSize: 16,
          fontWeight: FontWeight.w600,
        ),
      ),
    );
  }

  Widget _buildSettingTile({
    required IconData icon,
    required String title,
    required Color textColor,
    required Color iconBgColor,
    String? trailingText,
    bool showChevron = true,
    VoidCallback? onTap,
  }) {
    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: onTap ?? () {},
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
          child: Row(
            children: [
              Container(
                padding: const EdgeInsets.all(6),
                decoration: BoxDecoration(
                  color: iconBgColor,
                  shape: BoxShape.circle,
                ),
                child: Icon(icon, color: Colors.white, size: 16),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Text(
                  title,
                  style: TextStyle(
                    color: textColor,
                    fontSize: 15,
                    fontWeight: FontWeight.w500,
                  ),
                ),
              ),
              if (trailingText != null) ...[
                Text(
                  trailingText,
                  style: TextStyle(
                    color: Colors.grey.shade500,
                    fontSize: 13,
                  ),
                ),
                const SizedBox(width: 8),
              ],
              if (showChevron)
                Icon(
                  Icons.chevron_right_rounded,
                  color: Colors.grey.shade500,
                  size: 20,
                ),
            ],
          ),
        ),
      ),
    );
  }
}
