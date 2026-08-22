import 'package:flutter/material.dart';
import 'set_password_screen.dart';

class UserDetailsScreen extends StatefulWidget {
  final String? phone;
  final String? email;

  const UserDetailsScreen({super.key, this.phone, this.email});

  @override
  State<UserDetailsScreen> createState() => _UserDetailsScreenState();
}

class _UserDetailsScreenState extends State<UserDetailsScreen> {
  final TextEditingController _nameController = TextEditingController();
  final TextEditingController _dynamicController = TextEditingController();
  String? _selectedState;

  bool get _isPhoneProvided => widget.phone != null && widget.phone!.isNotEmpty;

  final List<String> _indianStates = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
    'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
    'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
    'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
    'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal'
  ];

  void _handleContinue() {
    final name = _nameController.text.trim();
    final dynamicValue = _dynamicController.text.trim();

    if (name.isEmpty || dynamicValue.isEmpty || _selectedState == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please fill all fields')),
      );
      return;
    }

    if (_isPhoneProvided && !dynamicValue.contains('@')) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please enter a valid email address')),
      );
      return;
    }

    if (!_isPhoneProvided && dynamicValue.length < 10) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please enter a valid mobile number')),
      );
      return;
    }

    final email = _isPhoneProvided ? dynamicValue : widget.email!;
    final phone = _isPhoneProvided ? widget.phone! : dynamicValue;

    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => SetPasswordScreen(
          phone: phone,
          name: name,
          email: email,
          state: _selectedState!,
        ),
      ),
    );
  }

  InputDecoration _premiumInputDecoration(String label, IconData icon) {
    return InputDecoration(
      labelText: label,
      labelStyle: TextStyle(color: Colors.grey.shade500),
      prefixIcon: Icon(icon, color: Colors.grey.shade400),
      filled: true,
      fillColor: Colors.grey.shade50,
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(16),
        borderSide: BorderSide.none,
      ),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(16),
        borderSide: BorderSide(color: Colors.grey.shade200, width: 1),
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(16),
        borderSide: const BorderSide(color: Color(0xFF3284FF), width: 1.5),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      extendBodyBehindAppBar: true,
      appBar: AppBar(
        title: const Text('Create Account', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
        backgroundColor: Colors.transparent,
        elevation: 0,
        iconTheme: const IconThemeData(color: Colors.white),
      ),
      body: Container(
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            colors: [Color(0xFF3284FF), Color(0xFF0D47A1)],
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
          ),
        ),
        child: SafeArea(
          child: Center(
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(24.0),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  // Icon
                  Container(
                    padding: const EdgeInsets.all(20),
                    decoration: BoxDecoration(
                      color: Colors.white.withValues(alpha: 0.15),
                      shape: BoxShape.circle,
                    ),
                    child: const Icon(Icons.person_add_rounded, size: 56, color: Colors.white),
                  ),
                  const SizedBox(height: 32),
                  // Floating Card
                  Container(
                    padding: const EdgeInsets.all(32),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(24),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withValues(alpha: 0.15),
                          blurRadius: 30,
                          offset: const Offset(0, 15),
                        ),
                      ],
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Complete your profile',
                          style: TextStyle(
                            fontSize: 26,
                            fontWeight: FontWeight.bold,
                            color: Colors.grey.shade900,
                            letterSpacing: -0.5,
                          ),
                        ),
                        const SizedBox(height: 8),
                        Text(
                          'Tell us a bit about yourself to\nget started',
                          style: TextStyle(fontSize: 15, color: Colors.grey.shade600, height: 1.4),
                        ),
                        const SizedBox(height: 32),
                        // Full Name
                        TextField(
                          controller: _nameController,
                          style: const TextStyle(fontSize: 16),
                          decoration: _premiumInputDecoration('Full Name', Icons.person_outline),
                        ),
                        const SizedBox(height: 16),
                        // Dynamic Field (Email or Phone)
                        TextField(
                          controller: _dynamicController,
                          keyboardType: _isPhoneProvided ? TextInputType.emailAddress : TextInputType.phone,
                          style: const TextStyle(fontSize: 16),
                          decoration: _premiumInputDecoration(
                            _isPhoneProvided ? 'Email Address' : 'Mobile Number',
                            _isPhoneProvided ? Icons.email_outlined : Icons.phone_outlined,
                          ),
                        ),
                        const SizedBox(height: 16),
                        // State Dropdown
                        DropdownButtonFormField<String>(
                          decoration: _premiumInputDecoration('Select State', Icons.location_on_outlined),
                          icon: Icon(Icons.keyboard_arrow_down_rounded, color: Colors.grey.shade400),
                          initialValue: _selectedState,
                          dropdownColor: Colors.white,
                          borderRadius: BorderRadius.circular(16),
                          style: const TextStyle(fontSize: 16, color: Color(0xFF1F2937)),
                          items: _indianStates.map((state) {
                            return DropdownMenuItem(
                              value: state,
                              child: Text(state),
                            );
                          }).toList(),
                          onChanged: (value) {
                            setState(() {
                              _selectedState = value;
                            });
                          },
                        ),
                        const SizedBox(height: 32),
                        // Terms
                        Center(
                          child: RichText(
                            textAlign: TextAlign.center,
                            text: TextSpan(
                              style: TextStyle(color: Colors.grey.shade600, fontSize: 13, height: 1.4),
                              children: const [
                                TextSpan(text: 'By continuing, you agree to our\n'),
                                TextSpan(
                                  text: 'Terms',
                                  style: TextStyle(
                                    fontWeight: FontWeight.bold,
                                    color: Color(0xFF3284FF),
                                    decoration: TextDecoration.underline,
                                  ),
                                ),
                                TextSpan(text: ' & '),
                                TextSpan(
                                  text: 'Privacy Policy',
                                  style: TextStyle(
                                    fontWeight: FontWeight.bold,
                                    color: Color(0xFF3284FF),
                                    decoration: TextDecoration.underline,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),
                        const SizedBox(height: 24),
                        // Continue Button
                        Container(
                          width: double.infinity,
                          height: 56,
                          decoration: BoxDecoration(
                            borderRadius: BorderRadius.circular(16),
                            gradient: const LinearGradient(
                              colors: [Color(0xFF3284FF), Color(0xFF2563EB)],
                            ),
                            boxShadow: [
                              BoxShadow(
                                color: const Color(0xFF3284FF).withValues(alpha: 0.3),
                                blurRadius: 12,
                                offset: const Offset(0, 6),
                              ),
                            ],
                          ),
                          child: ElevatedButton(
                            onPressed: _handleContinue,
                            style: ElevatedButton.styleFrom(
                              backgroundColor: Colors.transparent,
                              shadowColor: Colors.transparent,
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                            ),
                            child: const Text('Continue', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Colors.white, letterSpacing: 0.5)),
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
