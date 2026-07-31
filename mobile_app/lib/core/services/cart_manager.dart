import 'package:flutter/material.dart';

class CartManager {
  // Singleton pattern
  static final CartManager _instance = CartManager._internal();
  factory CartManager() => _instance;
  CartManager._internal();

  // Selected course to display in CartScreen
  Map<String, dynamic>? selectedCourse;

  // Global key to allow tab switching from anywhere
  final GlobalKey<State<BottomNavigationBar>> bottomNavKey = GlobalKey();
  
  // A callback to switch tabs (to be implemented in main_layout)
  Function(int)? switchTab;

  // A callback to refresh enrollment status after payment
  Future<void> Function()? refreshEnrollment;
}
