import 'package:flutter/material.dart';


import 'dashboard/home_screen.dart';
import 'dashboard/study_screen.dart';
import 'courses/courses_screen.dart';
import 'cart/cart_screen.dart';
import 'profile/profile_screen.dart';
import '../../core/services/api_service.dart';
import '../../core/services/cart_manager.dart';

class MainLayout extends StatefulWidget {
  const MainLayout({super.key});

  @override
  State<MainLayout> createState() => _MainLayoutState();
}

class _MainLayoutState extends State<MainLayout> {
  int _currentIndex = 1;
  bool _hasEnrolledCourses = false;
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _checkEnrollmentStatus();
    CartManager().switchTab = (index) {
      if (mounted) {
        setState(() {
          _currentIndex = index;
        });
      }
    };
    CartManager().refreshEnrollment = () async {
      await _checkEnrollmentStatus();
    };
  }

  Future<void> _checkEnrollmentStatus() async {
    try {
      final dashboardData = await ApiService().getStudentDashboard();
      if (mounted) {
        setState(() {
          final courses = dashboardData['enrolledCourses'] as List<dynamic>? ?? [];
          final currentCourse = dashboardData['course'];
          _hasEnrolledCourses = courses.isNotEmpty || currentCourse != null;
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _hasEnrolledCourses = false;
          _isLoading = false;
        });
      }
    }
  }

  List<Widget> get _screens => [
    _hasEnrolledCourses ? const StudyScreen() : const CoursesScreen(),
    const HomeScreen(),
    const CartScreen(),
    const ProfileScreen(),
  ];

  @override
  Widget build(BuildContext context) {
    return PopScope(
      canPop: false,
      child: Scaffold(
      backgroundColor: Theme.of(context).scaffoldBackgroundColor,
      body: _screens[_currentIndex],
      bottomNavigationBar: BottomNavigationBar(
        elevation: 0,
        currentIndex: _currentIndex,
        onTap: (index) {
          setState(() {
            _currentIndex = index;
          });
        },
        items: [
          BottomNavigationBarItem(
            icon: _hasEnrolledCourses ? const Icon(Icons.menu_book_outlined) : const Icon(Icons.search),
            label: _hasEnrolledCourses ? 'Study' : 'Courses',
          ),
          const BottomNavigationBarItem(
            icon: Icon(Icons.home_outlined),
            label: 'Home',
          ),
          const BottomNavigationBarItem(
            icon: Icon(Icons.shopping_cart_outlined),
            label: 'Cart',
          ),
          const BottomNavigationBarItem(
            icon: Icon(Icons.person_outline),
            label: 'Profile',
          ),
        ],
      ),
      ),
    );
  }
}
